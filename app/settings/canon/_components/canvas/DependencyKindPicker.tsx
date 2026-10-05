'use client'
import { dependencyKindLabels } from "../presentation"

type Props = {
  parentName: string
  childName: string
  kindIds: string[]
  onPick: (kindId: string) => void
  onCancel: () => void
}

// Shown when a new connection could mean more than one dependency kind.
const DependencyKindPicker = ({ parentName, childName, kindIds, onPick, onCancel }: Props) => {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-base-300/50">
      <div className="w-full max-w-md rounded-xl border border-base-300 bg-base-100 p-5 shadow-lg">
        <h3 className="text-lg font-semibold">How does {childName} depend on {parentName}?</h3>
        <div className="mt-4 flex flex-col gap-2">
          {kindIds.map((kindId) => (
            <button
              key={kindId}
              onClick={() => onPick(kindId)}
              className="rounded-lg border border-base-300 p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div className="font-medium">{dependencyKindLabels[kindId]?.label}</div>
              <div className="text-sm text-base-content/60">{dependencyKindLabels[kindId]?.explain(parentName, childName)}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onCancel} className="btn btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default DependencyKindPicker
