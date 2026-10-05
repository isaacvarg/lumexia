'use client'
import { useCallback, useEffect, useState } from "react"
import { TbBuildingWarehouse, TbPackage, TbPlus } from "react-icons/tb"
import Dialog from "@/components/Dialog"
import SectionTitle from "@/components/Text/SectionTitle"
import useDialog from "@/hooks/useDialog"
import { useItemSelection } from "@/store/itemSlice"
import { canonActions } from "@/actions/canon"
import type { CanonLookups } from "@/actions/canon/lookups"
import type { CanonEntry, ItemCanon } from "@/lib/canon/queries"
import CanonCard, { CanonAction } from "./CanonCard"
import HistoryPanel from "./HistoryPanel"
import ProposeForm from "./ProposeForm"
import ReviewSourceForm from "./ReviewSourceForm"

const DIALOG_ID = "canonAction"

type Supplier = { id: string; name: string }

const EntryGrid = ({ entries, onAction }: { entries: CanonEntry[]; onAction: (entry: CanonEntry, action: CanonAction) => void }) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    {entries.map((entry) => (
      <CanonCard key={entry.dataType.id} entry={entry} onAction={(action) => onAction(entry, action)} />
    ))}
  </div>
)

const Group = ({ icon: Icon, title, children }: { icon: typeof TbPackage; title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-3">
    <h3 className="flex items-center gap-2 text-lg font-semibold text-base-content/80">
      <Icon className="size-5" /> {title}
    </h3>
    {children}
  </div>
)

const Canon = () => {
  const { item } = useItemSelection()
  const { showDialog, resetDialogContext } = useDialog()

  const [canon, setCanon] = useState<ItemCanon | null>(null)
  const [lookups, setLookups] = useState<CanonLookups | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  // suppliers the user started this session, before they have any statements
  const [extraSuppliers, setExtraSuppliers] = useState<{ supplier: Supplier; entries: CanonEntry[] }[]>([])
  const [newSupplierId, setNewSupplierId] = useState("")
  const [active, setActive] = useState<{ entry: CanonEntry; action: CanonAction } | null>(null)

  const load = useCallback(async () => {
    if (!item) return
    const [nextCanon, nextLookups, nextSuppliers] = await Promise.all([
      canonActions.artifacts.getForItem(item.id),
      canonActions.lookups.getAll(),
      canonActions.artifacts.getSupplierOptions(),
    ])
    setCanon(nextCanon)
    setLookups(nextLookups)
    setSuppliers(nextSuppliers)
    // once a started supplier has a statement it comes back in canon.suppliers
    setExtraSuppliers((extra) => extra.filter((e) => !nextCanon.suppliers.some((s) => s.supplier.id === e.supplier.id)))
  }, [item])

  useEffect(() => { load() }, [load])

  const openAction = (entry: CanonEntry, action: CanonAction) => {
    setActive({ entry, action })
    showDialog(DIALOG_ID)
  }

  const finish = () => {
    resetDialogContext()
    setActive(null)
    load()
  }

  const startSupplier = async () => {
    if (!item || !newSupplierId) return
    const supplier = suppliers.find((s) => s.id === newSupplierId)!
    const entries = await canonActions.artifacts.getSupplierEntries(item.id, supplier.id)
    setExtraSuppliers((extra) => [...extra, { supplier, entries }])
    setNewSupplierId("")
  }

  if (!item) return null
  if (!canon || !lookups) return <div className="skeleton h-64 w-full" />

  const supplierGroups = [...canon.suppliers, ...extraSuppliers]
  const shownSupplierIds = new Set(supplierGroups.map((g) => g.supplier.id))
  const nothingApplies =
    canon.item.length === 0 && canon.supplierDataTypes.length === 0 && canon.finishedProducts.every((fp) => fp.entries.length === 0)

  return (
    <div className="flex flex-col gap-y-8">
      <SectionTitle>Canon</SectionTitle>

      {nothingApplies && (
        <div className="py-8 text-center text-base-content/60">
          No canon data types apply to this item yet. They&apos;re set up in Settings → Canon.
        </div>
      )}

      {canon.item.length > 0 && (
        <EntryGrid entries={canon.item} onAction={openAction} />
      )}

      {canon.supplierDataTypes.length > 0 && (
        <Group icon={TbBuildingWarehouse} title="Supplier statements">
          {supplierGroups.map(({ supplier, entries }) => (
            <div key={supplier.id} className="flex flex-col gap-2">
              <div className="font-medium">{supplier.name}</div>
              <EntryGrid entries={entries} onAction={openAction} />
            </div>
          ))}
          <div className="flex max-w-md gap-2">
            <select className="select select-sm flex-1" value={newSupplierId} onChange={(e) => setNewSupplierId(e.target.value)}>
              <option value="">Add statements from a supplier…</option>
              {suppliers.filter((s) => !shownSupplierIds.has(s.id)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={startSupplier} disabled={!newSupplierId} className="btn btn-sm btn-secondary" aria-label="Add supplier">
              <TbPlus className="size-4" />
            </button>
          </div>
        </Group>
      )}

      {canon.finishedProducts.filter((fp) => fp.entries.length > 0).map(({ finishedProduct, entries }) => (
        <Group key={finishedProduct.id} icon={TbPackage} title={finishedProduct.name}>
          <EntryGrid entries={entries} onAction={openAction} />
        </Group>
      ))}

      <Dialog.Root identifier={DIALOG_ID}>
        {active?.action === "propose" && (
          <ProposeForm entry={active.entry} lookups={lookups} files={canon.files} onDone={finish} />
        )}
        {(active?.action === "accept" || active?.action === "confirm") && (
          <ReviewSourceForm entry={active.entry} mode={active.action} onDone={finish} />
        )}
        {active?.action === "history" && (
          <HistoryPanel entry={active.entry} onChanged={load} />
        )}
      </Dialog.Root>
    </div>
  )
}

export default Canon
