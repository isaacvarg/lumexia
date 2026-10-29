import { IconType } from "react-icons"
import { TbAlertTriangle, TbArrowsDiff, TbFileAlert, TbFlask, TbHash, TbPackageExport, TbPackageImport } from "react-icons/tb"
import type { ReceivingFlag } from "@/lib/receiving/flags"

export const flagDisplay: Record<ReceivingFlag, { label: string; badge: string; icon: IconType; hint: string }> = {
  inspection: { label: "Inspection issue", badge: "badge-error", icon: TbAlertTriangle, hint: "Something failed the visual inspection at the dock" },
  overReceived: { label: "More than ordered", badge: "badge-warning", icon: TbPackageImport, hint: "More arrived than was still expected on the PO line" },
  shortReceived: { label: "Rest still expected", badge: "badge-info", icon: TbPackageExport, hint: "Less arrived than ordered; the rest stays open on the PO" },
  noSupplierLot: { label: "No supplier lot", badge: "badge-warning", icon: TbHash, hint: "The supplier's lot number wasn't recorded" },
  docsMissing: { label: "Docs missing", badge: "badge-warning", icon: TbFileAlert, hint: "A required lot document (e.g. COA) isn't on file yet" },
  outOfSpec: { label: "Out of spec", badge: "badge-error", icon: TbFlask, hint: "The supplier COA failed the item's approved baseline" },
  lotMismatch: { label: "COA lot mismatch", badge: "badge-warning", icon: TbArrowsDiff, hint: "A document on this lot names a different supplier lot" },
}

export const FlagBadge = ({ flag, size = "sm" }: { flag: ReceivingFlag; size?: "xs" | "sm" | "md" | "lg" }) => {
  const f = flagDisplay[flag]
  const Icon = f.icon
  return (
    <span className={`badge badge-soft badge-${size} ${f.badge} gap-1 whitespace-nowrap`} title={f.hint}>
      <Icon className="size-3.5" />
      {f.label}
    </span>
  )
}

const ReceivingFlags = ({ flags, size }: { flags: ReceivingFlag[]; size?: "xs" | "sm" | "md" | "lg" }) =>
  flags.length === 0 ? null : (
    <div className="flex flex-wrap gap-1">
      {Array.from(new Set(flags)).map((f) => <FlagBadge key={f} flag={f} size={size} />)}
    </div>
  )

export default ReceivingFlags
