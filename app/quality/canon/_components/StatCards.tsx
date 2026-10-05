import { IconType } from "react-icons"
import { TbAlertTriangle, TbChartPie, TbGitPullRequest, TbUserCheck } from "react-icons/tb"
import type { CanonDashboard } from "@/lib/canon/dashboard"

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

const StatCards = ({ summary }: { summary: CanonDashboard["summary"] }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
    <Stat
      icon={TbChartPie}
      label="Coverage"
      value={summary.coverage === null ? "—" : `${Math.round(summary.coverage * 100)}%`}
      hint={`${summary.covered} of ${summary.applicable} have an accepted value`}
      tone="bg-primary/10 text-primary"
    />
    <Stat
      icon={TbAlertTriangle}
      label="Needs attention"
      value={String(summary.needsAttention)}
      hint="Stale, source changed, expired or in conflict"
      tone={summary.needsAttention > 0 ? "bg-warning/15 text-warning" : "bg-success/10 text-success"}
    />
    <Stat
      icon={TbGitPullRequest}
      label="Waiting for review"
      value={String(summary.openChangeRequests)}
      hint="Open change requests"
      tone="bg-secondary/10 text-secondary"
    />
    <Stat
      icon={TbUserCheck}
      label="Waiting for you"
      value={String(summary.waitingForMe)}
      hint="Change requests you can decide"
      tone={summary.waitingForMe > 0 ? "bg-accent/15 text-accent" : "bg-success/10 text-success"}
    />
  </div>
)

export default StatCards
