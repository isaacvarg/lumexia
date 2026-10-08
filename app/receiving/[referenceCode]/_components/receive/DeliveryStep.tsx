'use client'
import { TbFile, TbX } from "react-icons/tb"
import type { PurchaseOrderItem } from "@/actions/purchasing/purchaseOrders/items/getAll"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import CaptureButtons from "./CaptureButtons"
import { DeliveryDraft } from "./draft"

type Props = {
  delivery: DeliveryDraft
  items: PurchaseOrderItem[]
  onChange: (delivery: DeliveryDraft) => void
}

const DeliveryStep = ({ delivery, items, onChange }: Props) => {
  const set = <K extends keyof DeliveryDraft>(key: K, value: DeliveryDraft[K]) => onChange({ ...delivery, [key]: value })

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-box bg-base-200/60 p-4">
        <div className="mb-2 font-semibold">Receiving</div>
        <ul className="flex flex-col gap-1 text-lg">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4">
              <span>{i.alias?.alias?.name ?? i.item.name}</span>
              <span className="text-base-content/60">{toFracitonalDigits.weight(i.quantity)} {i.uom.abbreviation}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-box border border-warning/40 bg-warning/5 p-4 text-base-content/80">
        Before signing for the freight, check the outside of the pallets for damage and note any on the carrier&apos;s paperwork.
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-medium">Packing slip number <span className="font-normal text-base-content/50">(optional)</span></span>
          <input className="input input-lg w-full" value={delivery.packingSlipNumber} onChange={(e) => set("packingSlipNumber", e.target.value)} autoCorrect="off" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-medium">Carrier <span className="font-normal text-base-content/50">(optional)</span></span>
          <input className="input input-lg w-full" value={delivery.carrier} onChange={(e) => set("carrier", e.target.value)} placeholder="e.g. UPS Freight" />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-medium">Packing slip or bill of lading</span>
        <CaptureButtons
          pathPrefix="receiving/packing-slips"
          cameraLabel="Photo of packing slip"
          fileLabel="Upload PDF"
          onUploaded={(files) => set("packingSlips", [...delivery.packingSlips, ...files])}
        />
        {delivery.packingSlips.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {delivery.packingSlips.map((f) => (
              <li key={f.fileId} className="badge badge-lg gap-2 py-4">
                <TbFile className="size-4" />
                <span className="max-w-48 truncate">{f.name}</span>
                <button type="button" aria-label={`Remove ${f.name}`} onClick={() => set("packingSlips", delivery.packingSlips.filter((x) => x.fileId !== f.fileId))}>
                  <TbX className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Notes <span className="font-normal text-base-content/50">(optional)</span></span>
        <textarea className="textarea textarea-lg w-full" rows={2} value={delivery.notes} onChange={(e) => set("notes", e.target.value)} />
      </label>
    </div>
  )
}

export default DeliveryStep
