'use client'
import { useCallback, useEffect, useState } from "react"
import { TbBuildingWarehouse, TbPackage, TbPlus } from "react-icons/tb"
import Dialog from "@/components/Dialog"
import SectionTitle from "@/components/Text/SectionTitle"
import useDialog from "@/hooks/useDialog"
import useToast from "@/hooks/useToast"
import { useItemSelection } from "@/store/itemSlice"
import { canonActions } from "@/actions/canon"
import type { CanonLookups } from "@/actions/canon/lookups"
import type { CanonEntry, ItemCanon, ItemCanonEntry } from "@/lib/canon/queries"
import CanonCard, { CanonAction } from "./CanonCard"
import HistoryPanel from "./HistoryPanel"
import ProposeForm from "./ProposeForm"
import ReviewSourceForm from "./ReviewSourceForm"
import SupplierStatements from "./SupplierStatements"

const DIALOG_ID = "canonAction"

type Supplier = { id: string; name: string }

type OnAction = (entry: CanonEntry, action: CanonAction) => void
// extra content under a card, e.g. its supplier statements
type RenderExtra = (entry: CanonEntry) => React.ReactNode

const EntryGrid = ({ entries, onAction, renderExtra }: { entries: CanonEntry[]; onAction: OnAction; renderExtra?: RenderExtra }) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    {entries.map((entry) => (
      <CanonCard key={entry.dataType.id} entry={entry} onAction={(action) => onAction(entry, action)}>
        {renderExtra?.(entry)}
      </CanonCard>
    ))}
  </div>
)

const Group = ({ icon: Icon, title, hint, children }: { icon: typeof TbPackage; title: string; hint?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-3">
    <div>
      <h3 className="flex items-center gap-2 text-lg font-semibold text-base-content/80">
        <Icon className="size-5" /> {title}
      </h3>
      {hint && <p className="text-sm text-base-content/60">{hint}</p>}
    </div>
    {children}
  </div>
)

// Sections by data type group, in the groups' order; ungrouped types last.
const byGroup = (entries: CanonEntry[]) => {
  const sections = new Map<string, { title: string | null; sequence: number; entries: CanonEntry[] }>()
  for (const entry of entries) {
    const group = entry.dataType.group
    const key = group?.id ?? "none"
    const section = sections.get(key) ?? { title: group?.name ?? null, sequence: group?.sequence ?? Infinity, entries: [] }
    section.entries.push(entry)
    sections.set(key, section)
  }
  return Array.from(sections.values()).sort((a, b) => a.sequence - b.sequence)
}

const GroupedEntries = ({ entries, onAction, renderExtra }: { entries: CanonEntry[]; onAction: OnAction; renderExtra?: RenderExtra }) => {
  const sections = byGroup(entries)
  // headers only help once something is grouped
  if (sections.length === 1 && sections[0].title === null) return <EntryGrid entries={entries} onAction={onAction} renderExtra={renderExtra} />
  return (
    <div className="flex flex-col gap-6">
      {sections.map((s) => (
        <div key={s.title ?? "none"} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">{s.title ?? "Other"}</h3>
          <EntryGrid entries={s.entries} onAction={onAction} renderExtra={renderExtra} />
        </div>
      ))}
    </div>
  )
}

const Canon = () => {
  const { item } = useItemSelection()
  const { showDialog, resetDialogContext } = useDialog()
  const { toast } = useToast()

  const [canon, setCanon] = useState<ItemCanon | null>(null)
  const [lookups, setLookups] = useState<CanonLookups | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  // per-supplier statements started this session that don't have a value yet
  const [started, setStarted] = useState<CanonEntry[]>([])
  const [newSupplierId, setNewSupplierId] = useState("")
  const [newDataTypeId, setNewDataTypeId] = useState("")
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
    // a started statement comes back from the server once it has an artifact
    const saved = new Set(
      nextCanon.suppliers.flatMap((s) => s.entries.map((e) => `${s.supplier.id}:${e.dataType.id}`)),
    )
    setStarted((list) => list.filter((e) => e.subject.kind === "itemSupplier" && !saved.has(`${e.subject.supplierId}:${e.dataType.id}`)))
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

  if (!item) return null
  if (!canon || !lookups) return <div className="skeleton h-64 w-full" />

  // existing statements plus started ones, per supplier
  const supplierGroups = new Map<string, { supplier: Supplier; entries: CanonEntry[] }>()
  for (const { supplier, entries } of canon.suppliers) supplierGroups.set(supplier.id, { supplier, entries: [...entries] })
  for (const entry of started) {
    const subject = entry.subject
    if (subject.kind !== "itemSupplier") continue
    const supplier = suppliers.find((s) => s.id === subject.supplierId)
    if (!supplier) continue
    const group = supplierGroups.get(supplier.id) ?? { supplier, entries: [] }
    group.entries.push(entry)
    supplierGroups.set(supplier.id, group)
  }
  const takenTypeIds = new Set(supplierGroups.get(newSupplierId)?.entries.map((e) => e.dataType.id) ?? [])
  const availableTypes = canon.supplierDataTypes.filter((d) => !takenTypeIds.has(d.id))

  const startStatement = async () => {
    if (!newSupplierId || !newDataTypeId) return
    try {
      const entry = await canonActions.artifacts.getSupplierEntry(item.id, newSupplierId, newDataTypeId)
      setStarted((list) => [...list, entry])
      setNewDataTypeId("")
    } catch (e) {
      toast("Could not add", (e as Error).message, "error")
    }
  }

  // a supplier statement on an item fact: fetch its entry and go straight to proposing a value
  const addStatement = async (dataTypeId: string, supplierId: string) => {
    try {
      const entry = await canonActions.artifacts.getSupplierEntry(item.id, supplierId, dataTypeId)
      openAction(entry, "propose")
    } catch (e) {
      toast("Could not add", (e as Error).message, "error")
    }
  }

  const itemEntryById = new Map(canon.item.map((e) => [e.dataType.id, e]))
  const renderStatements: RenderExtra = (entry) => {
    const itemEntry = itemEntryById.get(entry.dataType.id) as ItemCanonEntry | undefined
    if (!itemEntry?.dataType.allowSupplierStatements) return null
    return (
      <SupplierStatements
        statements={itemEntry.supplierStatements}
        suppliers={suppliers}
        canAdd={itemEntry.canEdit}
        onAction={openAction}
        onAdd={(supplierId) => addStatement(entry.dataType.id, supplierId)}
      />
    )
  }

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

      {canon.item.length > 0 && <GroupedEntries entries={canon.item} onAction={openAction} renderExtra={renderStatements} />}

      {canon.supplierDataTypes.length > 0 && (
        <Group
          icon={TbBuildingWarehouse}
          title="Per-supplier data"
          hint="Data types that only exist per supplier. For facts about the item itself, use an Item data type that allows supplier statements."
        >
          {Array.from(supplierGroups.values()).map(({ supplier, entries }) => (
            <div key={supplier.id} className="flex flex-col gap-2">
              <div className="font-medium">{supplier.name}</div>
              <EntryGrid entries={entries} onAction={openAction} />
            </div>
          ))}
          <div className="flex max-w-2xl flex-wrap gap-2">
            <select className="select select-sm w-56" value={newSupplierId} onChange={(e) => { setNewSupplierId(e.target.value); setNewDataTypeId("") }}>
              <option value="">Supplier…</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="select select-sm w-56" value={newDataTypeId} disabled={!newSupplierId} onChange={(e) => setNewDataTypeId(e.target.value)}>
              <option value="">Statement…</option>
              {availableTypes.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button onClick={startStatement} disabled={!newSupplierId || !newDataTypeId} className="btn btn-sm btn-secondary">
              <TbPlus className="size-4" /> Add statement
            </button>
          </div>
        </Group>
      )}

      {canon.finishedProducts.filter((fp) => fp.entries.length > 0).map(({ finishedProduct, entries }) => (
        <Group key={finishedProduct.id} icon={TbPackage} title={finishedProduct.name}>
          <GroupedEntries entries={entries} onAction={openAction} />
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
