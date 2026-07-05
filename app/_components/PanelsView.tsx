import { getHomeDashLayout } from "@/actions/users/homeDash/getHomeDashLayout"
import { getPanelEntry } from "./panels/registry"

// Spans only apply at md+; below md every panel is a single, equal-width column.
const spanClasses: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-1 md:col-span-2',
  3: 'col-span-1 md:col-span-3',
}

const PanelsView = async () => {

  const layout = await getHomeDashLayout()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
      {layout
        .filter(panel => panel.enabled)
        .map(panel => {
          const entry = getPanelEntry(panel.id)
          if (!entry) return null
          const { Component } = entry
          return (
            <div key={panel.id} className={`${spanClasses[panel.span] ?? 'col-span-1'} md:h-full md:[&>*]:h-full`}>
              <Component />
            </div>
          )
        })}
    </div>
  )
}

export default PanelsView
