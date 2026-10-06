import { IconType } from "react-icons"
import { TbAlertTriangle, TbCircleCheck, TbCircleDashed, TbClockExclamation } from "react-icons/tb"
import type { DocumentDashboard } from "@/lib/itemDocuments/dashboard"

const Stat = ({ icon: Icon, label, value, hint, tone }: { icon: IconType; label: string; value: string; hint: string; tone: string }) => (
  <div className="card border border-base-300 bg-base-100">
    <div className="card-body flex-row items-center gap-4">
      <div className={`grid size-12 shrink-0 place-items-center rounded-lg ${tone}`}>
        <Icon className="size-6" />
      </div>
      <div className="min-w-0">
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-base-content/60">{hint}</div>
      </div>
    </div>
  </div>
)

const StatCards = ({ summary }: { summary: DocumentDashboard["summary"] }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
    <Stat
      icon={TbCircleCheck}
      label="Items in order"
      value={summary.items === 0 ? "—" : `${summary.itemsInOrder} / ${summary.items}`}
      hint="Every required document current"
      tone="bg-success/10 text-success"
    />
    <Stat
      icon={TbCircleDashed}
      label="Missing"
      value={String(summary.missing)}
      hint="Required documents not on file"
      tone={summary.missing > 0 ? "bg-error/10 text-error" : "bg-success/10 text-success"}
    />
    <Stat
      icon={TbAlertTriangle}
      label="Expired"
      value={String(summary.expired)}
      hint={`Plus ${summary.expiring} expiring soon`}
      tone={summary.expired > 0 ? "bg-error/10 text-error" : summary.expiring > 0 ? "bg-warning/15 text-warning" : "bg-success/10 text-success"}
    />
    <Stat
      icon={TbClockExclamation}
      label="Needs review"
      value={String(summary.review)}
      hint="Missing dates, or our version's source was replaced"
      tone={summary.review > 0 ? "bg-info/15 text-info" : "bg-success/10 text-success"}
    />
  </div>
)

export default StatCards
