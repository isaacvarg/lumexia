'use client'
import { CanonShapeKey, diffContent } from "@/lib/canon/shapes"

const styles = {
  added: "bg-success/10 text-success",
  removed: "bg-error/10 text-error line-through",
  changed: "bg-warning/10",
  unchanged: "text-base-content/60",
}
const marks = { added: "+", removed: "−", changed: "~", unchanged: " " }

// Line diff between two contents of the same shape. `before` is null for a first version.
const DiffView = ({ shapeKey, before, after, hideUnchanged = false }: { shapeKey: CanonShapeKey; before: unknown | null; after: unknown; hideUnchanged?: boolean }) => {
  const lines = diffContent(shapeKey, before, after).filter((l) => !hideUnchanged || l.kind !== "unchanged")

  if (lines.length === 0) return <p className="text-sm italic text-base-content/60">No changes to the content.</p>

  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-base-300 p-2 font-mono text-sm">
      {lines.map((line, i) => (
        <div key={i} className={`flex gap-2 rounded px-2 py-0.5 ${styles[line.kind]}`}>
          <span className="w-3 shrink-0">{marks[line.kind]}</span>
          <span className="flex-1">{line.label}</span>
          {line.kind === "changed" ? (
            <span>{line.before} → {line.after}</span>
          ) : (
            line.label !== (line.after ?? line.before) && <span>{line.after ?? line.before}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default DiffView
