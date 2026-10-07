import { useEffect, useState } from "react"
import { TbInfoCircle } from "react-icons/tb"
import itemActions from "@/actions/inventory/items"
import { revalidatePage } from "@/actions/app/revalidatePage"
import { useItemSelection } from "@/store/itemSlice"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { getFinishedProductsFilledWith } from "../../_actions/basics/getFinishedProductsFilledWith"

// An item filled into a finished product is probably sold, so suggest marking it (never set automatically).
const SoldHint = () => {
  const { item } = useItemSelection()
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!item || item.isSold) return
    getFinishedProductsFilledWith(item.id).then((p) => setProducts(p ?? [])).catch(() => setProducts([]))
  }, [item])

  if (!item || item.isSold || products.length === 0) return null

  const markSold = async () => {
    setSaving(true)
    await itemActions.update({ id: item.id }, { isSold: true })
    await createActivityLog("modifyItem", "item", item.id, { context: "Marked as sold to customers" })
    revalidatePage("/inventory/items/[name]")
  }

  return (
    <div role="status" className="alert alert-info alert-soft mt-2 items-start text-sm">
      <TbInfoCircle className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-2">
        <span>
          This item is filled into <span className="font-medium">{products.map((p) => p.name).join(", ")}</span>.
          If it&apos;s sold to customers, mark it as sold so its sold-item document requirements apply.
        </span>
        <button type="button" onClick={markSold} disabled={saving} className="btn btn-info btn-xs self-start">
          {saving && <span className="loading loading-spinner loading-xs" />}
          Mark as sold
        </button>
      </div>
    </div>
  )
}

export default SoldHint
