'use client'
import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { TbPlus, TbTrash } from "react-icons/tb"
import useToast from "@/hooks/useToast"
import { canonActions } from "@/actions/canon"
import { validDependencyKinds } from "@/lib/canon/dependencyKinds"
import { CanonDataTypeRow, CanonSettingsData } from "../types"
import { dependencyKindLabels, subjectColors } from "../presentation"
import DataTypeNode, { DataTypeFlowNode } from "./DataTypeNode"
import DependencyKindPicker from "./DependencyKindPicker"
import DataTypeDrawer from "../drawer/DataTypeDrawer"

const nodeTypes = { dataType: DataTypeNode }

// types that were never placed get a simple grid so they don't stack at the origin
const toNodes = (dataTypes: CanonDataTypeRow[]): DataTypeFlowNode[] =>
  dataTypes.map((dataType, i) => {
    const unplaced = dataType.canvasX === 0 && dataType.canvasY === 0
    return {
      id: dataType.id,
      type: 'dataType',
      position: unplaced ? { x: (i % 3) * 320, y: Math.floor(i / 3) * 140 } : { x: dataType.canvasX, y: dataType.canvasY },
      data: { dataType },
    }
  })

const toEdges = (dataTypes: CanonDataTypeRow[]): Edge[] =>
  dataTypes.flatMap((dataType) =>
    dataType.parents.map((dep) => {
      const kind = dependencyKindLabels[dep.kindId]
      return {
        id: dep.id,
        source: dep.parentId,
        target: dep.childId,
        label: kind?.dashed ? kind.label : undefined,
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 6,
        style: { strokeWidth: 2, strokeDasharray: kind?.dashed ? '6 4' : undefined },
        markerEnd: { type: MarkerType.ArrowClosed },
      }
    }),
  )

type PendingConnection = { parentId: string; childId: string; kindIds: string[] }

const DataTypeCanvas = (props: CanonSettingsData) => {
  const { dataTypes } = props
  const router = useRouter()
  const { toast } = useToast()

  const [nodes, setNodes, onNodesChange] = useNodesState<DataTypeFlowNode>(toNodes(dataTypes))
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(toEdges(dataTypes))
  const [drawer, setDrawer] = useState<{ mode: 'create' } | { mode: 'edit'; id: string } | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingConnection | null>(null)

  // server data changed (router.refresh): keep positions the user just dragged, take everything else
  useEffect(() => {
    setNodes((current) => {
      const positions = new Map(current.map((n) => [n.id, n.position]))
      return toNodes(dataTypes).map((n) => ({ ...n, position: positions.get(n.id) ?? n.position }))
    })
    setEdges(toEdges(dataTypes))
  }, [dataTypes, setNodes, setEdges])

  const byId = useMemo(() => new Map(dataTypes.map((d) => [d.id, d])), [dataTypes])
  const editing = drawer?.mode === 'edit' ? byId.get(drawer.id) ?? null : null

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
      toast('Could not connect', `A ${parent.subjectType.name} type can't feed a ${child.subjectType.name} type.`, 'error')
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
        edges={edges.map((e) => ({ ...e, selected: e.id === selectedEdgeId }))}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => { setSelectedEdgeId(null); setDrawer({ mode: 'edit', id: node.id }) }}
        onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
        onPaneClick={() => { setSelectedEdgeId(null); setDrawer(null) }}
        onNodeDragStop={(_, node) => canonActions.dataTypes.setPosition(node.id, node.position.x, node.position.y)}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.4} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {/* toolbar */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <button onClick={() => setDrawer({ mode: 'create' })} className="btn btn-primary btn-sm">
          <TbPlus className="size-4" /> Data Type
        </button>
        {selectedEdgeId && (
          <button onClick={removeSelectedEdge} className="btn btn-error btn-soft btn-sm">
            <TbTrash className="size-4" /> Remove dependency
          </button>
        )}
      </div>

      {/* legend */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1 rounded-lg border border-base-300 bg-base-100/90 px-3 py-2 text-xs text-base-content/70">
        {props.lookups.subjectTypes.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${subjectColors[s.id]?.bg} border ${subjectColors[s.id]?.border}`} />
            {s.name}
          </div>
        ))}
        <div className="mt-1 border-t border-base-300 pt-1">Drag from a node&apos;s right edge to add a dependency</div>
      </div>

      {dataTypes.length === 0 && !drawer && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center text-base-content/60">
            <p className="text-lg font-medium">No data types yet</p>
            <p className="text-sm">Add one to start mapping your canon.</p>
          </div>
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

      {/* a just-created type shows once router.refresh brings it in */}
      {drawer && (drawer.mode === 'create' || editing) && (
        <DataTypeDrawer
          key={drawer.mode === 'edit' ? drawer.id : 'create'}
          dataType={editing}
          settings={props}
          onClose={() => setDrawer(null)}
          onCreated={(id) => setDrawer({ mode: 'edit', id })}
        />
      )}
    </div>
  )
}

export default DataTypeCanvas
