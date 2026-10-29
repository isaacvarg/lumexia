import Link from "next/link"
import PageTitle from "@/components/Text/PageTitle"
import prisma from "@/lib/prisma"
import { getQcReviewQueue, type QcReviewQueue } from "@/lib/qcCoaImport/queries"

// always reflect the latest imports
export const dynamic = "force-dynamic"

const reasonLabels: Record<string, string> = {
  lowConfidence: "Low confidence",
  needsHumanCheck: "Flagged by Hermes",
  newParameter: "New parameter",
  outcomeDisagreement: "Verdicts disagree",
  unitMismatch: "Unit mismatch",
  extraTest: "Not in baseline",
}

type ItemRef = { name: string; referenceCode: string }
const ItemLink = ({ item }: { item: ItemRef }) => (
  <Link href={`/inventory/items/${encodeURIComponent(item.name)}`} className="link link-hover">
    {item.name} <span className="text-base-content/60">{item.referenceCode}</span>
  </Link>
)

const Section = ({ title, hint, count, children }: { title: string; hint: string; count: number; children: React.ReactNode }) => (
  <section className="flex flex-col gap-y-2">
    <div className="flex items-baseline gap-x-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <span className="badge badge-sm badge-warning">{count}</span>
      <span className="text-sm text-base-content/60">{hint}</span>
    </div>
    {count === 0 ? <p className="text-sm text-base-content/60">Nothing waiting.</p> : <div className="overflow-x-auto">{children}</div>}
  </section>
)

const Outcome = ({ label, value }: { label: string; value: string | null }) => (value ? <span className="badge badge-soft badge-sm mr-1">{label}: {value}</span> : null)

const Queue = ({ queue }: { queue: QcReviewQueue }) => (
  <div className="flex flex-col gap-y-8">
    <Section title="Baselines to approve" hint="The first supplier COA of a resold item sets the standard later lots are checked against." count={queue.pendingBaselines.length}>
      <table className="table table-sm">
        <thead><tr><th>Item</th><th>Source COA</th><th>Since</th></tr></thead>
        <tbody>
          {queue.pendingBaselines.map((b) => (
            <tr key={b.id}>
              <td><ItemLink item={b.item} /></td>
              <td>{b.sourceItemFile?.file.name ?? "—"}{b.sourceItemFile?.supplierLotNumber ? ` (supplier lot ${b.sourceItemFile.supplierLotNumber})` : ""}</td>
              <td>{b.createdAt.toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>

    <Section title="Results to confirm" hint="Imported from a supplier COA and kept off generated COAs until a person confirms them." count={queue.needsReview.length}>
      <table className="table table-sm">
        <thead><tr><th>Item / lot</th><th>Test</th><th>Result</th><th>Why</th><th>Verdicts</th></tr></thead>
        <tbody>
          {queue.needsReview.map((r) => {
            const lot = r.qcRecord.examinedLot
            const reasons = (r.reviewReasons as string[] | null) ?? []
            return (
              <tr key={r.id}>
                <td><ItemLink item={lot.item} /> <span className="text-base-content/60">· {lot.lotNumber}</span></td>
                <td>{r.qcItemParameter.parameter.name}</td>
                <td>{r.value} {r.qcItemParameter.parameter.uom}</td>
                <td>{reasons.map((x) => <span key={x} className="badge badge-soft badge-warning badge-sm mr-1">{reasonLabels[x] ?? x}</span>)}</td>
                <td><Outcome label="ours" value={r.computedOutcome} /><Outcome label="Hermes" value={r.suggestedOutcome} /><Outcome label="supplier" value={r.supplierOutcome} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Section>

    <Section title="Out of specification" hint="Lots whose supplier COA failed the approved baseline." count={queue.outOfSpec.length}>
      <table className="table table-sm">
        <thead><tr><th>Item / lot</th><th>Failing tests</th></tr></thead>
        <tbody>
          {queue.outOfSpec.map((rec) => (
            <tr key={rec.id}>
              <td><ItemLink item={rec.examinedLot.item} /> <span className="text-base-content/60">· {rec.examinedLot.lotNumber}</span></td>
              <td>{rec.qcParameterResults.map((r) => `${r.qcItemParameter.parameter.name} ${r.value} ${r.qcItemParameter.parameter.uom}`.trim()).join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>

    <Section title="Missing or extra tests" hint="The COA left out baseline tests, or reported tests the baseline doesn't have." count={queue.gaps.length}>
      <table className="table table-sm">
        <thead><tr><th>Item / lot</th><th>Missing from this COA</th><th>Proposed additions</th></tr></thead>
        <tbody>
          {queue.gaps.map((g) => (
            <tr key={g.id}>
              <td><ItemLink item={g.lot.item} /> <span className="text-base-content/60">· {g.lot.lotNumber}</span></td>
              <td>{g.missingTests.join(", ") || "—"}</td>
              <td>{g.proposedAdditions.join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  </div>
)

const QcReviewPage = async () => {
  const queue = await getQcReviewQueue(prisma)
  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle>Quality review</PageTitle>
        <Link href="/quality/qc" className="btn btn-ghost btn-sm">Back to Quality</Link>
      </div>
      <Queue queue={queue} />
    </div>
  )
}

export default QcReviewPage
