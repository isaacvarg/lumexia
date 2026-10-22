import { CompletedAuditDetail } from "@/actions/inventory/auditRequests/getOneCompleted"
import Card from "@/components/Card"
import UserIcon from "@/components/UI/UserIcon"
import { dateFormatWithTime } from "@/configs/data/dateFormatString"
import { DateTime } from "luxon"

const DetailRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="flex justify-between items-center py-3 border-b border-zinc-800 last:border-b-0">
    <span className="text-sm text-zinc-400 font-poppins">{label}</span>
    <div className="text-sm font-poppins">{children}</div>
  </div>
)

const AuditDetails = ({ audit }: { audit: CompletedAuditDetail }) => {
  return (
    <Card.Root>
      <div className="flex flex-col">
        <DetailRow label="Requested By">
          <UserIcon kind={audit.requestedBy.kind} name={audit.requestedBy.name || ''} image={audit.requestedBy.image || ''} />
        </DetailRow>

        <DetailRow label="Conducted By">
          {audit.inventoryAudit ? (
            <UserIcon kind={audit.inventoryAudit.user.kind} name={audit.inventoryAudit.user.name || ''} image={audit.inventoryAudit.user.image || ''} />
          ) : (
            <span className="text-zinc-500">-</span>
          )}
        </DetailRow>

        <DetailRow label="Status">
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: audit.status.bgColor, color: audit.status.textColor }}
          >
            {audit.status.name}
          </span>
        </DetailRow>

        <DetailRow label="Created">
          {DateTime.fromJSDate(audit.createdAt).toFormat(dateFormatWithTime)}
        </DetailRow>

        <DetailRow label="Completed">
          {audit.inventoryAudit
            ? DateTime.fromJSDate(audit.inventoryAudit.createdAt).toFormat(dateFormatWithTime)
            : '-'
          }
        </DetailRow>

        <DetailRow label="Last Edited">
          {DateTime.fromJSDate(audit.updatedAt).toFormat(dateFormatWithTime)}
        </DetailRow>
      </div>
    </Card.Root>
  )
}

export default AuditDetails
