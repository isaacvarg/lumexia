'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbArrowDown, TbArrowUp, TbCheck, TbFolder, TbPencil, TbPlus, TbTrash, TbX } from "react-icons/tb"
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import useToast from "@/hooks/useToast"
import { canonActions } from "@/actions/canon"
import { CanonGroupRow } from "../types"

const GroupRow = ({ group, index, count, onMove }: { group: CanonGroupRow; index: number; count: number; onMove: (to: number) => void }) => {
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description ?? "")

  const save = async () => {
    if (!name.trim()) return
    try {
      await canonActions.groups.update(group.id, { name, description: description || null })
      setEditing(false)
      router.refresh()
    } catch {
      toast("Could not rename", `A group named "${name}" may already exist.`, "error")
    }
  }

  const remove = async () => {
    const types = group._count.dataTypes
    if (!confirm(`Delete ${group.name}?${types > 0 ? ` Its ${types} data type${types === 1 ? "" : "s"} will become ungrouped.` : ""}`)) return
    await canonActions.groups.delete(group.id)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <TbFolder className="size-5" />
      </div>

      {editing ? (
        <div className="flex flex-1 flex-col gap-2 md:flex-row">
          <input className="input input-sm md:w-56" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input input-sm flex-1" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      ) : (
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{group.name}</div>
          <div className="truncate text-sm text-base-content/60">
            {group._count.dataTypes} data type{group._count.dataTypes === 1 ? "" : "s"}
            {group.description && ` · ${group.description}`}
          </div>
        </div>
      )}

      <div className="flex shrink-0 gap-1">
        {editing ? (
          <>
            <button onClick={save} className="btn btn-success btn-sm btn-square" aria-label="Save"><TbCheck /></button>
            <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm btn-square" aria-label="Cancel"><TbX /></button>
          </>
        ) : (
          <>
            <button onClick={() => onMove(index - 1)} disabled={index === 0} className="btn btn-ghost btn-sm btn-square" aria-label="Move up"><TbArrowUp /></button>
            <button onClick={() => onMove(index + 1)} disabled={index === count - 1} className="btn btn-ghost btn-sm btn-square" aria-label="Move down"><TbArrowDown /></button>
            <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm btn-square" aria-label={`Rename ${group.name}`}><TbPencil /></button>
            <button onClick={remove} className="btn btn-error btn-soft btn-sm btn-square" aria-label={`Delete ${group.name}`}><TbTrash /></button>
          </>
        )}
      </div>
    </div>
  )
}

const Groups = ({ groups }: { groups: CanonGroupRow[] }) => {
  const router = useRouter()
  const { toast } = useToast()
  const [isAdd, setIsAdd] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const create = async () => {
    if (!name.trim()) return
    try {
      await canonActions.groups.create({ name, description })
      setName("")
      setDescription("")
      setIsAdd(false)
      router.refresh()
    } catch {
      toast("Could not create group", `A group named "${name}" may already exist.`, "error")
    }
  }

  const move = async (from: number, to: number) => {
    if (to < 0 || to >= groups.length) return
    const ids = groups.map((g) => g.id)
    const [moved] = ids.splice(from, 1)
    ids.splice(to, 0, moved)
    await canonActions.groups.reorder(ids)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Groups</SectionTitle>
        <button onClick={() => setIsAdd((v) => !v)} className="btn btn-secondary"><TbPlus className="size-4" /></button>
      </div>

      <p className="text-base-content/70">
        Organise data types, e.g. a Website group for listings, sprites and content blocks. Groups order how
        data types appear in settings, on an item&apos;s Canon tab and on the dashboard.
      </p>

      {isAdd && (
        <Card.Root>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-sm font-medium">Name</span>
              <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website" />
            </label>
            <label className="flex flex-[2] flex-col gap-1">
              <span className="text-sm font-medium">Description</span>
              <input className="input w-full" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <button onClick={create} className="btn btn-success">Create</button>
          </div>
        </Card.Root>
      )}

      {groups.length === 0 && !isAdd && <p className="italic text-base-content/50">No groups yet.</p>}

      <div className="flex flex-col gap-2">
        {groups.map((group, i) => (
          <GroupRow key={group.id} group={group} index={i} count={groups.length} onMove={(to) => move(i, to)} />
        ))}
      </div>
    </div>
  )
}

export default Groups
