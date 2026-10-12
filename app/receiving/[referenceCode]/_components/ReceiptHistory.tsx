'use client'
import { DateTime } from "luxon"
import Link from "next/link"
import { TbExternalLink, TbFile, TbPhoto } from "react-icons/tb"
import type { ReceiptView, ReceivingFileType } from "@/lib/receiving/queries"
import { checkLabel } from "@/lib/receiving/checks"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { formatDate, StatusBadge } from "@/components/ItemDocuments/presentation"
import ReceivingFlags from "@/components/Receiving/ReceivingFlags"
import SectionTitle from "@/components/Text/SectionTitle"
import { dateFormatWithTime } from "@/configs/data/dateFormatString"
import { slugify } from "@/utils/slug"

type Props = { receipts: ReceiptView[]; fileTypes: ReceivingFileType[] }

const FileLink = ({ file, icon: Icon }: { file: { id: string; name: string; url: string }; icon: typeof TbFile }) => (
  <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost border-base-300">
    <Icon className="size-4" /> <span className="max-w-40 truncate">{file.name}</span> <TbExternalLink className="size-3.5" />
  </a>
)

// What arrived in each delivery, as checked in at the dock, with what still needs a look.
const ReceiptHistory = ({ receipts, fileTypes }: Props) => {
  if (receipts.length === 0) return null
  const typeName = (id: string) => fileTypes.find((t) => t.id === id)?.abbreviaton || fileTypes.find((t) => t.id === id)?.name || "Document"

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>Deliveries</SectionTitle>
      {receipts.map((receipt) => (
        <section key={receipt.id} className="flex flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="font-semibold">
              {DateTime.fromJSDate(new Date(receipt.createdAt)).toFormat(dateFormatWithTime)}
              <span className="font-normal text-base-content/60"> · received by {receipt.receivedBy.name}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 text-sm text-base-content/60">
              {receipt.packingSlipNumber && <span>Packing slip {receipt.packingSlipNumber}</span>}
              {receipt.carrier && <span>{receipt.carrier}</span>}
            </div>
          </div>
          {receipt.notes && <p className="text-base-content/80">{receipt.notes}</p>}
          {receipt.packingSlips.length > 0 && (
            <div className="flex flex-wrap gap-2">{receipt.packingSlips.map((f) => <FileLink key={f.id} file={f} icon={TbFile} />)}</div>
          )}

          {receipt.lines.map((line) => {
            const failed = Object.entries(line.checks).filter(([, a]) => a === "fail").map(([k]) => checkLabel(k))
            return (
              <div key={line.id} className="flex flex-col gap-3 rounded-lg bg-base-200/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/inventory/items/${slugify(line.item.name)}?id=${line.item.id}`} className="link-hover text-lg font-semibold">
                    {line.item.name}
                  </Link>
                  <span>
                    {toFracitonalDigits.weight(line.receivedQuantity)} of {toFracitonalDigits.weight(line.openQuantity)} {line.uom}
                  </span>
                </div>
                <ReceivingFlags flags={line.flags} />
                {failed.length > 0 && (
                  <p className="text-sm">
                    <span className="font-medium text-error">Failed: {failed.join(", ")}.</span> {line.issueNote}
                  </p>
                )}
                {line.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2">{line.photos.map((f) => <FileLink key={f.id} file={f} icon={TbPhoto} />)}</div>
                )}
                <ul className="flex flex-col divide-y divide-base-300">
                  {line.lots.map((lot) => (
                    <li key={lot.id} className="flex flex-col gap-1 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                          <span className="font-mono font-semibold">{lot.lotNumber}</span>
                          <span className="text-base-content/60"> · supplier lot </span>
                          <span className="font-mono">{lot.supplierLotNumber ?? "none"}</span>
                        </span>
                        <span>
                          {lot.quantity !== null ? `${toFracitonalDigits.weight(lot.quantity)} ${line.uom}` : `${toFracitonalDigits.weight(lot.initialQuantity)} ${lot.inventoryUom}`}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/60">
                        {lot.expiresAt && <span>Expires {formatDate(lot.expiresAt)}</span>}
                        {lot.documents.map((d) => (
                          <span key={d.fileTypeId} className="flex items-center gap-1">
                            {typeName(d.fileTypeId)} <StatusBadge status={d.status} size="xs" />
                          </span>
                        ))}
                      </div>
                      {/* document problems already show as statuses above */}
                      <ReceivingFlags flags={lot.flags.filter((f) => f !== "docsMissing" && f !== "lotMismatch")} size="xs" />
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}

export default ReceiptHistory
