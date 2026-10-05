'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbArchive, TbX } from "react-icons/tb"
import useToast from "@/hooks/useToast"
import { canonActions } from "@/actions/canon"
import { canonShapes } from "@/configs/staticRecords/canonShapes"
import { canonSubjectTypes } from "@/configs/staticRecords/canonSubjectTypes"
import { CanonDataTypeRow, CanonSettingsData } from "../types"
import PermissionsPanel from "./PermissionsPanel"
import Section from "./Section"

type Props = {
  dataType: CanonDataTypeRow | null
  settings: CanonSettingsData
  onClose: () => void
  onCreated: (id: string) => void
}

const subjectIdByKind: Record<string, string> = canonSubjectTypes

const tagOptionsOf = (dataType: CanonDataTypeRow | null) => {
  const options = (dataType?.shapeConfig as { options?: string[] } | null)?.options
  return options?.join("\n") ?? ""
}

const DataTypeDrawer = ({ dataType, settings, onClose, onCreated }: Props) => {
  const router = useRouter()
  const { toast } = useToast()
  const { lookups, resolvers, itemTypes, procurementTypes } = settings

  const [name, setName] = useState(dataType?.name ?? "")
  const [description, setDescription] = useState(dataType?.description ?? "")
  const [resolverKey, setResolverKey] = useState(dataType?.resolverKey ?? "")
  const [shapeId, setShapeId] = useState(dataType?.shapeId ?? canonShapes.text)
  const [subjectTypeId, setSubjectTypeId] = useState(dataType?.subjectTypeId ?? canonSubjectTypes.item)
  const [tagOptions, setTagOptions] = useState(tagOptionsOf(dataType))
  const [requiredApprovals, setRequiredApprovals] = useState(dataType?.requiredApprovals ?? 1)
  const [requiresDifferentReviewer, setRequiresDifferentReviewer] = useState(dataType?.requiresDifferentReviewer ?? false)
  const [requiresEvidence, setRequiresEvidence] = useState(dataType?.requiresEvidence ?? false)
  const [reverifyAfterDays, setReverifyAfterDays] = useState(dataType?.reverifyAfterDays?.toString() ?? "")
  const [procurementTypeId, setProcurementTypeId] = useState(dataType?.procurementTypeId ?? "")
  const [itemTypeIds, setItemTypeIds] = useState<string[]>(dataType?.itemTypes.map((t) => t.itemTypeId) ?? [])
  const [externalKey, setExternalKey] = useState(dataType?.externalKey ?? "")
  const [saving, setSaving] = useState(false)

  const isLinked = resolverKey !== ""
  const hasArtifacts = (dataType?._count.artifacts ?? 0) > 0
  const resolver = resolvers.find((r) => r.key === resolverKey)

  // a linked type's shape and subject come from its resolver
  const chooseResolver = (key: string) => {
    setResolverKey(key)
    const next = resolvers.find((r) => r.key === key)
    if (next) {
      setShapeId(canonShapes[next.shapeKey as keyof typeof canonShapes])
      setSubjectTypeId(subjectIdByKind[next.subjectKind])
    }
  }

  const toggleItemType = (id: string) =>
    setItemTypeIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]))

  const save = async () => {
    if (!name.trim()) {
      toast('Missing name', 'Give the data type a name.', 'error')
      return
    }
    const options = tagOptions.split("\n").map((o) => o.trim()).filter(Boolean)
    if (shapeId === canonShapes.tagSet && options.length === 0) {
      toast('Missing options', 'A tag set needs at least one option.', 'error')
      return
    }

    const input = {
      name,
      description: description || null,
      shapeId,
      subjectTypeId,
      shapeConfig: shapeId === canonShapes.tagSet ? { options } : null,
      resolverKey: resolverKey || null,
      externalKey: externalKey || null,
      requiredApprovals,
      requiresDifferentReviewer,
      requiresEvidence,
      reverifyAfterDays: reverifyAfterDays ? Number(reverifyAfterDays) : null,
      procurementTypeId: procurementTypeId || null,
      itemTypeIds,
    }

    setSaving(true)
    try {
      if (dataType) {
        await canonActions.dataTypes.update(dataType.id, input)
        toast('Saved', `${name} was updated.`, 'success')
      } else {
        const created = await canonActions.dataTypes.create(input)
        toast('Created', `${name} was added. Now set who can edit and review it.`, 'success')
        onCreated(created.id)
      }
      router.refresh()
    } catch (e) {
      toast('Could not save', (e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const archive = async () => {
    if (!dataType) return
    if (!confirm(`Archive ${dataType.name}? It stops applying to items, but its history is kept.`)) return
    await canonActions.dataTypes.archive(dataType.id)
    onClose()
    router.refresh()
  }

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-full max-w-md flex-col border-l border-base-300 bg-base-100 shadow-xl">
      <header className="flex items-start justify-between gap-4 border-b border-base-300 px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold">{dataType ? dataType.name : "New data type"}</h3>
          <p className="text-sm text-base-content/60">
            {dataType
              ? `${dataType._count.artifacts} artifact${dataType._count.artifacts === 1 ? "" : "s"}`
              : "Define a kind of canonical data."}
          </p>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-sm btn-square" aria-label="Close">
          <TbX className="size-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Section title="General">
          <label className="fieldset-label">Name</label>
          <input className="input input-sm w-full" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="fieldset-label">Description</label>
          <textarea className="textarea textarea-sm w-full" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Section>

        <Section
          title="Source"
          hint={hasArtifacts ? "Source, shape and subject are locked because artifacts already exist." : undefined}
        >
          <div className="join w-full">
            <button
              type="button"
              disabled={hasArtifacts}
              onClick={() => setResolverKey("")}
              className={`btn btn-sm join-item flex-1 ${!isLinked ? "btn-primary" : ""}`}
            >
              Authored
            </button>
            <button
              type="button"
              disabled={hasArtifacts || resolvers.length === 0}
              onClick={() => chooseResolver(resolvers[0].key)}
              className={`btn btn-sm join-item flex-1 ${isLinked ? "btn-primary" : ""}`}
            >
              Linked to Lumexia
            </button>
          </div>

          {isLinked && (
            <>
              <label className="fieldset-label">Lumexia source</label>
              <select className="select select-sm w-full" disabled={hasArtifacts} value={resolverKey} onChange={(e) => chooseResolver(e.target.value)}>
                {resolvers.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
              {resolver && <p className="text-xs text-base-content/60">{resolver.description}</p>}
            </>
          )}

          <label className="fieldset-label">Applies to</label>
          <select className="select select-sm w-full" disabled={hasArtifacts || isLinked} value={subjectTypeId} onChange={(e) => setSubjectTypeId(e.target.value)}>
            {lookups.subjectTypes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label className="fieldset-label">Shape</label>
          <select className="select select-sm w-full" disabled={hasArtifacts || isLinked} value={shapeId} onChange={(e) => setShapeId(e.target.value)}>
            {lookups.shapes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <p className="text-xs text-base-content/60">{lookups.shapes.find((s) => s.id === shapeId)?.description}</p>

          {shapeId === canonShapes.tagSet && (
            <>
              <label className="fieldset-label">Tag options (one per line)</label>
              <textarea className="textarea textarea-sm w-full font-mono" rows={4} value={tagOptions} onChange={(e) => setTagOptions(e.target.value)} />
            </>
          )}
        </Section>

        <Section title="Approvals">
          <label className="fieldset-label">Approvals required</label>
          <input type="number" min={1} className="input input-sm w-24" value={requiredApprovals} onChange={(e) => setRequiredApprovals(Math.max(1, Number(e.target.value)))} />
          <label className="label cursor-pointer justify-start gap-3">
            <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={requiresDifferentReviewer} onChange={(e) => setRequiresDifferentReviewer(e.target.checked)} />
            <span className="text-sm">Requester can&apos;t approve their own change</span>
          </label>
          {!isLinked && (
            <label className="label cursor-pointer justify-start gap-3">
              <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={requiresEvidence} onChange={(e) => setRequiresEvidence(e.target.checked)} />
              <span className="text-sm">Every change needs evidence</span>
            </label>
          )}
          <label className="fieldset-label">Re-verify after (days)</label>
          <input type="number" min={1} placeholder="Never" className="input input-sm w-32" value={reverifyAfterDays} onChange={(e) => setReverifyAfterDays(e.target.value)} />
        </Section>

        <Section title="Scope" hint="Leave empty to apply to every item.">
          <label className="fieldset-label">Procurement type</label>
          <select className="select select-sm w-full" value={procurementTypeId} onChange={(e) => setProcurementTypeId(e.target.value)}>
            <option value="">All</option>
            {procurementTypes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <label className="fieldset-label">Item types</label>
          <div className="flex flex-wrap gap-2">
            {itemTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleItemType(t.id)}
                className={`badge badge-lg cursor-pointer ${itemTypeIds.includes(t.id) ? "badge-primary" : "badge-ghost"}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Website" hint="Where this appears on the website, for a future sync.">
          <label className="fieldset-label">External key</label>
          <input className="input input-sm w-full font-mono" placeholder="e.g. _product_sprites" value={externalKey} onChange={(e) => setExternalKey(e.target.value)} />
        </Section>

        <div className="flex items-center justify-between py-2">
          {dataType ? (
            <button onClick={archive} className="btn btn-ghost btn-sm text-error">
              <TbArchive className="size-4" /> Archive
            </button>
          ) : <span />}
          <button onClick={save} disabled={saving} className="btn btn-success btn-sm">
            {saving ? "Saving..." : dataType ? "Save" : "Create"}
          </button>
        </div>

        {dataType && <PermissionsPanel dataType={dataType} settings={settings} />}
      </div>
    </aside>
  )
}

export default DataTypeDrawer
