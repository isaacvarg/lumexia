'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createDocumentRequirement, DocumentRequirementRow, updateDocumentRequirement } from "@/actions/inventory/documentRequirements"
import { requirementIssuers, requirementLevels, requirementLotOrigins, requirementScopes, RequirementInput } from "@/lib/itemDocuments/rules"
import { Option } from "./types"

type Props = {
  requirement?: DocumentRequirementRow
  defaults?: Partial<RequirementInput>
  itemTypes: Option[]
  procurementTypes: Option[]
  fileTypes: Option[]
  onDone: () => void
}

const toDateInput = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "")

const Segmented = <T extends string>({ value, options, onChange }: {
  value: T
  options: { value: T; label: string; description: string }[]
  onChange: (v: T) => void
}) => (
  <div className="join">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        title={o.description}
        aria-pressed={value === o.value}
        onClick={() => onChange(o.value)}
        className={`btn btn-sm join-item ${value === o.value ? "btn-primary" : "btn-ghost border-base-300"}`}
      >
        {o.label}
      </button>
    ))}
  </div>
)

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-1">
    <span className="text-sm font-medium">{label}</span>
    {children}
    {hint && <span className="text-xs text-base-content/50">{hint}</span>}
  </label>
)

const RequirementForm = ({ requirement, defaults, itemTypes, procurementTypes, fileTypes, onDone }: Props) => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [value, setValue] = useState({
    itemTypeId: requirement?.itemTypeId ?? defaults?.itemTypeId ?? "",
    procurementTypeId: requirement?.procurementTypeId ?? defaults?.procurementTypeId ?? "",
    // select values: "" any, "true" sold, "false" not sold
    sold: String(requirement?.sold ?? defaults?.sold ?? ""),
    fileTypeId: requirement?.fileTypeId ?? "",
    level: requirement?.level ?? "required",
    scope: requirement?.scope ?? "item",
    issuer: requirement?.issuer ?? "supplier",
    lotOrigin: requirement?.lotOrigin ?? "",
    validForMonths: requirement?.validForMonths?.toString() ?? "",
    warnDays: (requirement?.warnDays ?? 60).toString(),
    minIssuedAt: toDateInput(requirement?.minIssuedAt ?? null),
    notes: requirement?.notes ?? "",
  })
  const set = <K extends keyof typeof value>(key: K, v: (typeof value)[K]) => setValue((prev) => ({ ...prev, [key]: v }))
  const excluded = value.level === "excluded"

  const save = async () => {
    setSaving(true)
    const input: RequirementInput = {
      itemTypeId: value.itemTypeId || null,
      procurementTypeId: value.procurementTypeId || null,
      sold: value.sold === "" ? null : value.sold === "true",
      fileTypeId: value.fileTypeId,
      level: value.level,
      scope: value.scope,
      issuer: value.issuer,
      lotOrigin: value.scope === "lot" ? value.lotOrigin || null : null,
      validForMonths: value.validForMonths ? Number(value.validForMonths) : null,
      warnDays: value.warnDays ? Number(value.warnDays) : 0,
      minIssuedAt: value.minIssuedAt ? new Date(value.minIssuedAt) : null,
      notes: value.notes,
    }
    const result = requirement
      ? await updateDocumentRequirement(requirement.id, input)
      : await createDocumentRequirement(input)
    setSaving(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    router.refresh()
    onDone()
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/40 bg-base-100 p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Field label="Item type">
          <select className="select select-sm w-full" value={value.itemTypeId} onChange={(e) => set("itemTypeId", e.target.value)}>
            <option value="">Any item type</option>
            {itemTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Procurement type">
          <select className="select select-sm w-full" value={value.procurementTypeId} onChange={(e) => set("procurementTypeId", e.target.value)}>
            <option value="">Any procurement type</option>
            {procurementTypes.map((t) => <option key={t.id} value={t.id} className="capitalize">{t.name}</option>)}
          </select>
        </Field>
        <Field label="Sold to customers">
          <select className="select select-sm w-full" value={value.sold} onChange={(e) => set("sold", e.target.value)}>
            <option value="">Sold or not</option>
            <option value="true">Only sold items</option>
            <option value="false">Only items not sold</option>
          </select>
        </Field>
        <Field label="Document">
          <select className="select select-sm w-full" value={value.fileTypeId} onChange={(e) => set("fileTypeId", e.target.value)}>
            <option value="" disabled>Choose a file type</option>
            {fileTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <Field label="Issued by">
          <Segmented value={value.issuer} options={requirementIssuers} onChange={(v) => set("issuer", v)} />
        </Field>
        <Field label="Level">
          <Segmented value={value.level} options={requirementLevels} onChange={(v) => set("level", v)} />
        </Field>
        {!excluded && (
          <Field label="Applies">
            <Segmented value={value.scope} options={requirementScopes} onChange={(v) => set("scope", v)} />
          </Field>
        )}
        {!excluded && value.scope === "lot" && (
          <Field label="Which lots">
            <Segmented
              value={value.lotOrigin}
              options={requirementLotOrigins.map((o) => ({ ...o, value: o.value ?? "" }))}
              onChange={(v) => set("lotOrigin", v)}
            />
          </Field>
        )}
      </div>

      {excluded ? (
        <p className="text-sm text-base-content/60">
          Items matching this rule won&apos;t need this document, even if a broader rule asks for it.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="Months valid" hint="From the issue date. Blank = never expires.">
            <input type="number" min={1} className="input input-sm w-full" value={value.validForMonths} onChange={(e) => set("validForMonths", e.target.value)} placeholder="e.g. 36" />
          </Field>
          <Field label="Warn days before" hint="Shows as expiring inside this window.">
            <input type="number" min={0} className="input input-sm w-full" value={value.warnDays} onChange={(e) => set("warnDays", e.target.value)} />
          </Field>
          <Field label="Issued on or after" hint="Older documents count as expired, e.g. a new IFRA amendment.">
            <input type="date" className="input input-sm w-full" value={value.minIssuedAt} onChange={(e) => set("minIssuedAt", e.target.value)} />
          </Field>
          <Field label="Note for uploaders">
            <input className="input input-sm w-full" value={value.notes} onChange={(e) => set("notes", e.target.value)} placeholder="e.g. From the manufacturer" />
          </Field>
        </div>
      )}

      {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="btn btn-ghost btn-sm">Cancel</button>
        <button type="button" onClick={save} disabled={saving} className="btn btn-success btn-sm">
          {saving && <span className="loading loading-spinner loading-xs" />}
          {requirement ? "Save" : "Add requirement"}
        </button>
      </div>
    </div>
  )
}

export default RequirementForm
