'use client'
import Card from "@/components/Card"
import { useAppForm } from "@/components/Form2"
import SectionTitle from "@/components/Text/SectionTitle"
import useToast from "@/hooks/useToast"
import type { ApiKeyListing } from "@/lib/apiKeys"
import { ApiKeyExpiry, createMyApiKey, revokeApiKey, setApiKeyAccess } from "@/actions/users/apiKeys"
import { DateTime } from "luxon"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { TbCopy, TbPlus, TbX } from "react-icons/tb"

const expiryOptions: { label: string, value: ApiKeyExpiry }[] = [
  { label: 'Never', value: 'never' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
  { label: '1 year', value: '365' },
]

const formatDate = (date: Date | null) =>
  date ? DateTime.fromJSDate(date).toLocaleString(DateTime.DATETIME_MED) : '—'

const keyStatus = (key: ApiKeyListing) => {
  if (key.revokedAt) return { label: 'Revoked', badge: 'badge-error' }
  if (key.expiresAt && key.expiresAt <= new Date()) return { label: 'Expired', badge: 'badge-warning' }
  return { label: 'Active', badge: 'badge-success' }
}

type Props = {
  keys: ApiKeyListing[]
  // Admins viewing another user can revoke but not create; keys always belong to their creator.
  canCreate?: boolean
  // The viewer is a system admin: they can create write or delegate keys and change that access on any key.
  isAdmin?: boolean
}

const hasWrite = (key: ApiKeyListing) => key.scopes.includes('write')
const hasDelegate = (key: ApiKeyListing) => key.scopes.includes('delegate')

const ApiKeysPanel = ({ keys, canCreate = true, isAdmin = false }: Props) => {

  const router = useRouter()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [newKey, setNewKey] = useState<{ name: string, key: string } | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [allowWrite, setAllowWrite] = useState(false)
  const [allowDelegate, setAllowDelegate] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => setOrigin(window.location.origin), [])

  const form = useAppForm({
    defaultValues: { name: '', expiry: 'never' as ApiKeyExpiry },
    onSubmit: async ({ value, formApi }) => {
      try {
        const { apiKey, key } = await createMyApiKey({ ...value, allowWrite: isAdmin && allowWrite, allowDelegate: isAdmin && allowDelegate })
        setNewKey({ name: apiKey.name, key })
        setIsCreating(false)
        setAllowWrite(false)
        setAllowDelegate(false)
        formApi.reset()
        router.refresh()
      } catch (err: any) {
        toast('Could not create key', err?.message ?? 'Something went wrong', 'error')
      }
    }
  })

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast('Copied', 'Copied to clipboard.', 'success')
    } catch {
      toast('Copy failed', 'Could not copy to clipboard.', 'error')
    }
  }

  const handleRevoke = async (key: ApiKeyListing) => {
    if (!confirm(`Revoke ${key.name}? Any agent using it loses access immediately.`)) return
    setRevokingId(key.id)
    try {
      await revokeApiKey(key.id)
      router.refresh()
    } catch (err: any) {
      toast('Could not revoke key', err?.message ?? 'Something went wrong', 'error')
    } finally {
      setRevokingId(null)
    }
  }

  const toggleWrite = async (key: ApiKeyListing) => {
    const enable = !hasWrite(key)
    const message = enable
      ? `Allow ${key.name} to write? Agents using it can file item documents and approve or reject pricing as its owner.`
      : `Make ${key.name} read-only? Agents using it can no longer change documents or review pricing as its owner.`
    if (!confirm(message)) return
    try {
      await setApiKeyAccess(key.id, 'write', enable)
      router.refresh()
    } catch (err: any) {
      toast('Could not change access', err?.message ?? 'Something went wrong', 'error')
    }
  }

  const toggleDelegate = async (key: ApiKeyListing) => {
    const enable = !hasDelegate(key)
    const message = enable
      ? `Let ${key.name} act for linked users? An agent using it (e.g. Hermes on WhatsApp) can approve or reject pricing as anyone who linked their number to Lumexia.`
      : `Stop ${key.name} acting for linked users?`
    if (!confirm(message)) return
    try {
      await setApiKeyAccess(key.id, 'delegate', enable)
      router.refresh()
    } catch (err: any) {
      toast('Could not change access', err?.message ?? 'Something went wrong', 'error')
    }
  }

  const claudeCommand = newKey
    ? `claude mcp add --transport http lumexia ${origin}/api/mcp --header "Authorization: Bearer ${newKey.key}"`
    : ''

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <SectionTitle>API Keys</SectionTitle>
        {canCreate && !isCreating && (
          <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(true)}>
            <TbPlus className="w-5 h-5" /> New key
          </button>
        )}
      </div>

      <p className="text-base-content/70">
        API keys let agents like Claude Code or Hermes read Lumexia data through the MCP endpoint. A key acts as
        {canCreate ? ' you' : ' this user'}, with the same permissions. Keys are read-only unless an admin gives
        them write access, which lets agents file item documents and review pricing. A shared agent like Hermes
        can instead be allowed to act for linked users: people who linked their WhatsApp number below.
      </p>

      {newKey && (
        <Card.Root>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base-content">{newKey.name} created</span>
              <span className="text-sm text-warning">Copy this key now. It won&apos;t be shown again.</span>
            </div>
            <button type="button" className="btn btn-ghost btn-square" aria-label="Dismiss" onClick={() => setNewKey(null)}>
              <TbX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-base-200 p-3 text-sm">{newKey.key}</code>
            <button type="button" className="btn btn-ghost btn-square" aria-label="Copy key" onClick={() => copy(newKey.key)}>
              <TbCopy className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-base-content/70">Add it to Claude Code:</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-base-200 p-3 text-sm">{claudeCommand}</code>
              <button type="button" className="btn btn-ghost btn-square" aria-label="Copy command" onClick={() => copy(claudeCommand)}>
                <TbCopy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card.Root>
      )}

      {isCreating && (
        <Card.Root>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.AppField
              name="name"
              validators={{ onChange: ({ value }) => !value.trim() ? { message: 'A key needs a name' } : undefined }}
            >
              {(field) => <field.TextField label="Name" labelClass="soft" description="Where the key will be used, e.g. Claude Code (desktop) or Hermes." />}
            </form.AppField>

            <form.AppField name="expiry">
              {(field) => <field.SelectField label="Expires" labelClass="soft" options={expiryOptions} />}
            </form.AppField>

            {isAdmin && (
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="checkbox mt-0.5" checked={allowWrite} onChange={(e) => setAllowWrite(e.target.checked)} />
                <span className="flex flex-col">
                  <span className="font-medium">Allow write</span>
                  <span className="text-sm text-base-content/60">Agents using this key can file item documents and approve or reject pricing as you.</span>
                </span>
              </label>
            )}

            {isAdmin && (
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="checkbox mt-0.5" checked={allowDelegate} onChange={(e) => setAllowDelegate(e.target.checked)} />
                <span className="flex flex-col">
                  <span className="font-medium">Act for linked users</span>
                  <span className="text-sm text-base-content/60">For a shared agent like Hermes: it can approve or reject pricing as whoever messages it from a linked WhatsApp number.</span>
                </span>
              </label>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" className="btn btn-ghost" onClick={() => setIsCreating(false)}>Cancel</button>
              <form.AppForm>
                <form.SubmitButton>Create key</form.SubmitButton>
              </form.AppForm>
            </div>
          </form>
        </Card.Root>
      )}

      <Card.Root>
        {keys.length === 0 ? (
          <p className="text-base-content/70">No API keys yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Status</th>
                  <th>Access</th>
                  <th>Last used</th>
                  <th>Expires</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {keys.map(key => {
                  const status = keyStatus(key)
                  return (
                    <tr key={key.id}>
                      <td className="font-medium">{key.name}</td>
                      <td><code className="text-sm">{key.prefix}…</code></td>
                      <td><span className={`badge ${status.badge}`}>{status.label}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`badge badge-soft ${hasWrite(key) ? 'badge-warning' : 'badge-ghost'}`}>
                            {hasWrite(key) ? 'Read & write' : 'Read'}
                          </span>
                          {isAdmin && !key.revokedAt && (
                            <button type="button" className="btn btn-xs btn-ghost" onClick={() => toggleWrite(key)}>
                              {hasWrite(key) ? 'Make read-only' : 'Allow write'}
                            </button>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {hasDelegate(key) && <span className="badge badge-soft badge-info">Acts for linked users</span>}
                          {isAdmin && !key.revokedAt && (
                            <button type="button" className="btn btn-xs btn-ghost" onClick={() => toggleDelegate(key)}>
                              {hasDelegate(key) ? 'Stop acting for users' : 'Act for linked users'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>{key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}</td>
                      <td>{key.expiresAt ? formatDate(key.expiresAt) : 'Never'}</td>
                      <td>{formatDate(key.createdAt)}</td>
                      <td className="text-right">
                        {!key.revokedAt && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline btn-error"
                            disabled={revokingId === key.id}
                            onClick={() => handleRevoke(key)}
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card.Root>
    </div>
  )
}

export default ApiKeysPanel
