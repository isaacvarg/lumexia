'use client'
import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MarkerType,
  ReactFlow,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TbTrash } from "react-icons/tb"
import useToast from "@/hooks/useToast"
import { canonActions } from "@/actions/canon"
import { validDependencyKinds } from "@/lib/canon/dependencyKinds"
import { CanonDataTypeRow, CanonSettingsData } from "../types"
import { dependencyKindLabels, subjectColors, subjectLabels } from "../presentation"
import DataTypeNode, { DataTypeFlowNode } from "./DataTypeNode"
import DependencyKindPicker from "./DependencyKindPicker"

const nodeTypes = { dataType: DataTypeNode }

// types that were never placed get a simple grid so they don't stack at the origin
const toNodes = (dataTypes: CanonDataTypeRow[], matchIds: Set<string> | null): DataTypeFlowNode[] =>
  dataTypes.map((dataType, i) => {
    const unplaced = dataType.canvasX === 0 && dataType.canvasY === 0
    return {
      id: dataType.id,
      type: 'dataType',
      position: unplaced ? { x: (i % 3) * 320, y: Math.floor(i / 3) * 140 } : { x: dataType.canvasX, y: dataType.canvasY },
      data: { dataType, dimmed: !!matchIds && !matchIds.has(dataType.id) },
    }
  })

const toEdges = (dataTypes: CanonDataTypeRow[], matchIds: Set<string> | null): Edge[] =>
  dataTypes.flatMap((dataType) =>
    dataType.parents.map((dep) => {
      const kind = dependencyKindLabels[dep.kindId]
      const dimmed = !!matchIds && !(matchIds.has(dep.parentId) && matchIds.has(dep.childId))
      return {
        id: dep.id,
        source: dep.parentId,
        target: dep.childId,
        label: kind?.dashed ? kind.label : undefined,
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 6,
        style: { strokeWidth: 2, strokeDasharray: kind?.dashed ? '6 4' : undefined, opacity: dimmed ? 0.15 : 1 },
        markerEnd: { type: MarkerType.ArrowClosed },
      }
    }),
  )

type PendingConnection = { parentId: string; childId: string; kindIds: string[] }

type Props = {
  settings: CanonSettingsData
  // null = no search or filter; otherwise the ids to keep bright and zoom to
  matchIds: Set<string> | null
  selectedId: string | null
  onOpen: (id: string) => void
  onClose: () => void
}

const DataTypeCanvas = ({ settings, matchIds, selectedId, onOpen, onClose }: Props) => {
  const { dataTypes } = settings
  const router = useRouter()
  const { toast } = useToast()
  const flow = useRef<ReactFlowInstance<DataTypeFlowNode, Edge> | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<DataTypeFlowNode>(toNodes(dataTypes, matchIds))
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(toEdges(dataTypes, matchIds))
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingConnection | null>(null)

  // server data or filter changed: keep positions the user just dragged, take everything else
  useEffect(() => {
    setNodes((current) => {
      const positions = new Map(current.map((n) => [n.id, n.position]))
      return toNodes(dataTypes, matchIds).map((n) => ({
        ...n,
        position: positions.get(n.id) ?? n.position,
        selected: n.id === selectedId,
      }))
    })
    setEdges(toEdges(dataTypes, matchIds))
  }, [dataTypes, matchIds, selectedId, setNodes, setEdges])

  // zoom to whatever the search or group filter matched
  const fitToMatches = useCallback((instance: ReactFlowInstance<DataTypeFlowNode, Edge>, duration: number) => {
    if (!matchIds) {
      instance.fitView({ padding: 0.3, maxZoom: 1, duration })
      return
    }
    if (matchIds.size === 0) return
    instance.fitView({ nodes: Array.from(matchIds).map((id) => ({ id })), padding: 0.4, maxZoom: 1.2, duration })
  }, [matchIds])

  useEffect(() => {
    if (flow.current) fitToMatches(flow.current, 300)
  }, [fitToMatches])

  const byId = useMemo(() => new Map(dataTypes.map((d) => [d.id, d])), [dataTypes])
  const shownEdges: Edge[] = useMemo(
    () => edges.map((e) => ({ ...e, selected: e.id === selectedEdgeId })),
    [edges, selectedEdgeId],
  )

  const createDependency = useCallback(async (parentId: string, childId: string, kindId: string) => {
    try {
      await canonActions.dependencies.create({ parentId, childId, kindId })
      router.refresh()
    } catch (e) {
      toast('Could not connect', (e as Error).message, 'error')
    }
  }, [router, toast])

  const onConnect = useCallback((connection: Connection) => {
    const parent = byId.get(connection.source)
    const child = byId.get(connection.target)
    if (!parent || !child) return

    const kindIds = validDependencyKinds(parent.subjectTypeId, child.subjectTypeId)
    if (kindIds.length === 0) {
      toast(
        'Could not connect',
        `"${subjectLabels[parent.subjectTypeId]?.label}" can't feed "${subjectLabels[child.subjectTypeId]?.label}".`,
        'error',
      )
      return
    }
    if (kindIds.length === 1) {
      createDependency(parent.id, child.id, kindIds[0])
      return
    }
    setPending({ parentId: parent.id, childId: child.id, kindIds })
  }, [byId, createDependency, toast])

  const removeSelectedEdge = async () => {
    if (!selectedEdgeId) return
    await canonActions.dependencies.delete(selectedEdgeId)
    setSelectedEdgeId(null)
    router.refresh()
  }

  return (
    <div className="relative h-[75vh] overflow-clip rounded-xl border border-base-300 bg-base-200">
      <ReactFlow
        nodes={nodes}
        edges={shownEdges}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          flow.current = instance
          requestAnimationFrame(() => fitToMatches(instance, 0))
        }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => { setSelectedEdgeId(null); onOpen(node.id) }}
        onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
        onPaneClick={() => { setSelectedEdgeId(null); onClose() }}
        onNodeDragStop={(_, node) => canonActions.dataTypes.setPosition(node.id, node.position.x, node.position.y)}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.4} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {selectedEdgeId && (
        <div className="absolute left-4 top-4 z-10">
          <button onClick={removeSelectedEdge} className="btn btn-error btn-soft btn-sm">
            <TbTrash className="size-4" /> Remove dependency
          </button>
        </div>
      )}

      {/* legend */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1 rounded-lg border border-base-300 bg-base-100/90 px-3 py-2 text-xs text-base-content/70">
        {settings.lookups.subjectTypes.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${subjectColors[s.id]?.bg} border ${subjectColors[s.id]?.border}`} />
            {subjectLabels[s.id]?.label ?? s.name}
          </div>
        ))}
        <div className="mt-1 border-t border-base-300 pt-1">Drag from a node&apos;s right edge to add a dependency</div>
      </div>

      {dataTypes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center text-base-content/60">
            <p className="text-lg font-medium">No data types yet</p>
            <p className="text-sm">Add one to start mapping your canon.</p>
          </div>
        </div>
      )}

      {matchIds?.size === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
          <span className="badge badge-lg">No data types match</span>
        </div>
      )}

      {pending && (
        <DependencyKindPicker
          parentName={byId.get(pending.parentId)?.name ?? ''}
          childName={byId.get(pending.childId)?.name ?? ''}
          kindIds={pending.kindIds}
          onCancel={() => setPending(null)}
          onPick={(kindId) => { createDependency(pending.parentId, pending.childId, kindId); setPending(null) }}
        />
      )}
    </div>
  )
}

export default DataTypeCanvas
