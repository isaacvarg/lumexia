'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import SortablePanelRow from "./SortablePanelRow"
import { HomeDashPanel } from "@/actions/users/homeDash/getHomeDashLayout"
import { updateHomeDashPanel } from "@/actions/users/homeDash/updateHomeDashPanel"
import { reorderHomeDash } from "@/actions/users/homeDash/reorderHomeDash"
import { PanelSpan } from "@/app/_components/panels/registry"

const DashboardSettings = ({ layout }: { layout: HomeDashPanel[] }) => {

  const router = useRouter()
  const [panels, setPanels] = useState<HomeDashPanel[]>(layout)

  useEffect(() => {
    setPanels(layout)
  }, [layout])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleToggle = async (id: string, enabled: boolean) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, enabled } : p))
    await updateHomeDashPanel(id, { enabled })
    router.refresh()
  }

  const handleSpanChange = async (id: string, span: PanelSpan) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, span } : p))
    await updateHomeDashPanel(id, { span })
    router.refresh()
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = panels.findIndex(p => p.id === active.id)
    const newIndex = panels.findIndex(p => p.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const reordered = arrayMove(panels, oldIndex, newIndex).map((p, i) => ({ ...p, order: i }))
    setPanels(reordered)

    await reorderHomeDash(reordered.map(p => p.id))
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>Dashboard Panels</SectionTitle>

      <Card.Root>
        <p className="text-base-content/70">
          Toggle panels on or off, set their width, and drag to reorder how they appear on your home dashboard.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={panels.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {panels.map(panel => (
                <SortablePanelRow
                  key={panel.id}
                  panel={panel}
                  onToggle={(enabled) => handleToggle(panel.id, enabled)}
                  onSpanChange={(span) => handleSpanChange(panel.id, span)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card.Root>
    </div>
  )
}

export default DashboardSettings
