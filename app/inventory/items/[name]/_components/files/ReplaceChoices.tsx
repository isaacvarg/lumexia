'use client'
import { useState } from "react"
import { TbReplace } from "react-icons/tb"
import { normalizeSupplierLot } from "@/lib/itemDocuments/supplierLots"
import { ItemFile } from "../../_actions/files/getAllItemFiles"
import { DocumentFormValue } from "./DocumentForm"

// documents waiting for a lot only replace ones waiting for the same supplier lot (see supersede.ts)
const sameWaitingLot = (a: string | null, b: string) => normalizeSupplierLot(a ?? "") === normalizeSupplierLot(b)

// Current files of the same document as a new upload. Same supplier: replaced automatically. Different (or no)
// supplier: the uploader decides, defaulting to replace when either side has no supplier set.
export const useReplaceChoices = (value: DocumentFormValue, files: ItemFile[], enabled: boolean) => {
  const [choices, setChoices] = useState<Record<string, boolean>>({})
  const sameDocument = !enabled || !value.fileTypeId
    ? []
    : files.filter((f) => !f.supersededAt && f.fileTypeId === value.fileTypeId && f.issuer === value.issuer && (f.lotId ?? "") === value.lotId && (!!value.lotId || sameWaitingLot(f.supplierLotNumber, value.supplierLotNumber)))
  const autoReplaced = sameDocument.filter((f) => (f.supplierId ?? "") === value.supplierId)
  const otherSuppliers = sameDocument.filter((f) => (f.supplierId ?? "") !== value.supplierId)
  const willReplace = (f: ItemFile) => choices[f.id] ?? (!f.supplierId || !value.supplierId)
  return {
    autoReplaced,
    otherSuppliers,
    willReplace,
    choose: (id: string, replace: boolean) => setChoices((prev) => ({ ...prev, [id]: replace })),
    // current files from another supplier the uploader chose to replace
    alsoReplaceIds: otherSuppliers.filter(willReplace).map((f) => f.id),
  }
}

const ReplaceChoices = ({ choices }: { choices: ReturnType<typeof useReplaceChoices> }) => {
  const { autoReplaced, otherSuppliers, willReplace, choose } = choices
  if (autoReplaced.length === 0 && otherSuppliers.length === 0) return null
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-base-300 p-3 text-sm">
      {autoReplaced.map((f) => (
        <div key={f.id} className="flex items-center gap-2 text-base-content/70">
          <TbReplace className="size-4 shrink-0" />
          <span>Replaces <span className="font-medium text-base-content">{f.file.name}</span>{f.supplier && ` (${f.supplier.name})`}</span>
        </div>
      ))}
      {otherSuppliers.map((f) => (
        <label key={f.id} className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-sm mt-0.5"
            checked={willReplace(f)}
            onChange={(e) => choose(f.id, e.target.checked)}
          />
          <span>
            <span className="font-medium">{f.file.name}</span>
            {f.supplier ? ` from ${f.supplier.name}` : " (no supplier)"} is also current. Replace it with this upload?
            <span className="block text-xs text-base-content/50">
              Leave unchecked if both suppliers&apos; documents should stay current.
            </span>
          </span>
        </label>
      ))}
    </div>
  )
}

export default ReplaceChoices
