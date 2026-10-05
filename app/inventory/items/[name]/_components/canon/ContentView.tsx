'use client'
import { CanonShapeKey, parseContent } from "@/lib/canon/shapes"

const percent = (min: number | null, max: number | null) => {
  if (min === null && max === null) return "—"
  if (min === max || max === null) return `${min}%`
  if (min === null) return `≤${max}%`
  return `${min}–${max}%`
}

// Read-only rendering of canon content for each shape.
const ContentView = ({ shapeKey, content }: { shapeKey: CanonShapeKey; content: unknown }) => {
  switch (shapeKey) {
    case "text":
      return <p className="whitespace-pre-wrap">{parseContent("text", content).text}</p>

    case "richText":
      return <p className="whitespace-pre-wrap">{parseContent("richText", content).plain}</p>

    case "boolean": {
      const { value } = parseContent("boolean", content)
      return <span className={`badge badge-lg ${value ? "badge-success" : "badge-error"} badge-soft`}>{value ? "Yes" : "No"}</span>
    }

    case "orderedList":
      return (
        <ol className="list-inside list-decimal">
          {parseContent("orderedList", content).items.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      )

    case "tagSet":
      return (
        <div className="flex flex-wrap gap-2">
          {parseContent("tagSet", content).tags.map((tag) => <span key={tag} className="badge badge-lg badge-soft">{tag}</span>)}
        </div>
      )

    case "blockList":
      return (
        <div className="flex flex-col gap-3">
          {parseContent("blockList", content).blocks.map((block, i) => (
            <div key={i}>
              <div className="font-semibold">{block.title}</div>
              <p className="whitespace-pre-wrap text-base-content/80">{block.body}</p>
            </div>
          ))}
        </div>
      )

    case "keyValue":
      return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
          {parseContent("keyValue", content).rows.map((row, i) => (
            <div key={i} className="contents">
              <dt className="font-medium text-base-content/70">{row.key}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      )

    case "composition":
      return (
        <table className="table table-sm">
          <thead><tr><th>INCI</th><th>CAS</th><th className="text-right">%</th></tr></thead>
          <tbody>
            {parseContent("composition", content).rows.map((row, i) => (
              <tr key={i}>
                <td>{row.inci}</td>
                <td className="font-mono text-sm">{row.cas ?? "—"}</td>
                <td className="text-right">{percent(row.percentMin, row.percentMax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case "billOfMaterials":
      return (
        <table className="table table-sm">
          <thead><tr><th>#</th><th>Material</th><th>Step</th><th className="text-right">%</th></tr></thead>
          <tbody>
            {parseContent("billOfMaterials", content).rows.map((row) => (
              <tr key={`${row.identifier}-${row.itemId}`}>
                <td className="whitespace-nowrap font-mono text-sm">{row.identifier}</td>
                <td>{row.itemName}</td>
                <td>{row.stepSequence}{row.phase ? ` · ${row.phase}` : ""}</td>
                <td className="text-right">{row.concentration}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
  }
}

export default ContentView
