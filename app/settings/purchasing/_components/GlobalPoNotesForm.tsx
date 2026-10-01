'use client'

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { TbArrowDown, TbArrowUp, TbPlus, TbTrash } from "react-icons/tb"
import Card from "@/components/Card"
import useToast from "@/hooks/useToast"
import { appActions } from "@/actions/app"

// local ids keep row identity stable while reordering / removing
type NoteRow = { id: string; content: string }

let rowCounter = 0
const toRow = (content: string): NoteRow => ({ id: `note-${rowCounter++}`, content })

const GlobalPoNotesForm = ({ notes }: { notes: string[] }) => {

  const router = useRouter()
  const { toast } = useToast()

  const [rows, setRows] = useState<NoteRow[]>(() => notes.map(toRow))
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = useMemo(
    () => rows.length !== notes.length || rows.some((row, i) => row.content !== notes[i]),
    [rows, notes]
  )

  const updateRow = (id: string, content: string) =>
    setRows(current => current.map(row => row.id === id ? { ...row, content } : row))

  const removeRow = (id: string) =>
    setRows(current => current.filter(row => row.id !== id))

  const moveRow = (index: number, direction: -1 | 1) =>
    setRows(current => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const addRow = () => setRows(current => [...current, toRow('')])

  const handleSave = async () => {
    if (!isDirty) return
    try {
      setIsSaving(true)
      await appActions.configs.updateGlobalPoNotes(rows.map(row => row.content))
      toast('Global PO notes saved', '', 'success')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast('Failed to save global PO notes', String(err), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card.Root>
      <Card.Title>Global Purchase Order Notes</Card.Title>

      <p className="font-poppins text-lg text-base-content">These notes appear on every purchase order PDF, before PO-specific and supplier notes.</p>

      <div className="flex flex-col gap-3">
        {rows.length === 0 && (
          <p className="text-base-content/60">No global notes. Purchase orders will only show PO-specific and supplier notes.</p>
        )}

        {rows.map((row, index) => (
          <div key={row.id} className="flex items-start gap-3">
            <span className="pt-3 font-medium text-base-content/60 w-6 text-right">{index + 1}.</span>
            <textarea
              className="textarea textarea-bordered flex-1"
              rows={2}
              value={row.content}
              placeholder="Note text"
              onChange={(e) => updateRow(row.id, e.target.value)}
            />
            <div className="flex gap-1 pt-1">
              <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label="Move up" disabled={index === 0} onClick={() => moveRow(index, -1)}>
                <TbArrowUp className="text-lg" />
              </button>
              <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label="Move down" disabled={index === rows.length - 1} onClick={() => moveRow(index, 1)}>
                <TbArrowDown className="text-lg" />
              </button>
              <button type="button" className="btn btn-ghost btn-sm btn-square text-error" aria-label="Remove note" onClick={() => removeRow(row.id)}>
                <TbTrash className="text-lg" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button type="button" className="btn btn-soft btn-secondary" onClick={addRow}>
          <TbPlus className="text-lg" /> Add note
        </button>

        <button
          type="button"
          className="btn btn-neutral"
          disabled={!isDirty || isSaving}
          onClick={handleSave}
        >
          {isSaving ? <span className="loading loading-spinner" /> : null}
          Save
        </button>
      </div>
    </Card.Root>
  )
}

export default GlobalPoNotesForm
