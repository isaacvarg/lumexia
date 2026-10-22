'use client'
import Card from "@/components/Card"
import { useAppForm } from "@/components/Form2"
import SectionTitle from "@/components/Text/SectionTitle"
import useToast from "@/hooks/useToast"
import type { ApiKeyListing, GrantableScope } from "@/lib/apiKeys"
import { ApiKeyExpiry, createAgentApiKey, createMyApiKey, revokeApiKey, setApiKeyAccess } from "@/actions/users/apiKeys"
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
  // Admins viewing another person can revoke but not create; a person's keys belong to whoever created them.
  canCreate?: boolean
  // The viewer is a system admin: they can create write or delegate keys and change that access on any key.
  isAdmin?: boolean
  // Viewing an agent user: keys are created for the agent, which never signs in to make its own.
  agentUserId?: string
}

// Access beyond reading, granted by a system admin. Order is display order.
const grants: {
  scope: GrantableScope
  label: string
  description: string
  badge: string
  enableConfirm: (name: string) => string
  disableConfirm: (name: string) => string
}[] = [
  {
    scope: 'write',
    label: 'Write',
    description: 'File item documents and approve or reject pricing as the key\'s owner.',
    badge: 'badge-warning',
    enableConfirm: (name) => `Allow ${name} to write? Agents using it can file item documents and approve or reject pricing as its owner.`,
    disableConfirm: (name) => `Remove write access from ${name}? Agents using it can no longer change documents or review pricing as its owner.`,
  },
  {
    scope: 'delegate',
    label: 'Act for linked users',
    description: 'For a shared agent like Hermes: it acts as whoever messages it from a linked account (WhatsApp, Discord, Telegram, Slack, a Hermes profile).',
    badge: 'badge-info',
    enableConfirm: (name) => `Let ${name} act for linked users? An agent using it can act as anyone who linked an account to Lumexia, within what this key allows.`,
    disableConfirm: (name) => `Stop ${name} acting for linked users?`,
  },
  {
    scope: 'propose',
    label: 'Propose Canon changes',
    description: 'Open Canon change requests, add evidence, and withdraw its own requests. It can never approve or reject: give the key\'s user Edit, never Review.',
    badge: 'badge-accent',
    enableConfirm: (name) => `Let ${name} propose Canon changes? Every proposal still needs a reviewer. Make sure its user holds Edit only, never Review.`,
    disableConfirm: (name) => `Stop ${name} proposing Canon changes?`,
  },
  {
    scope: 'alias:write',
    label: 'Edit aliases',
    description: 'Add, rename and remove item aliases (e.g. WooCommerce ids) with the existing alias types.',
    badge: 'badge-secondary',
    enableConfirm: (name) => `Let ${name} add, rename and remove item aliases?`,
    disableConfirm: (name) => `Stop ${name} editing item aliases?`,
  },
]

const has = (key: ApiKeyListing, scope: GrantableScope) => key.scopes.includes(scope)

const ApiKeysPanel = ({ keys, canCreate = true, isAdmin = false, agentUserId }: Props) => {

  const router = useRouter()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [newKey, setNewKey] = useState<{ name: string, key: string } | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [selectedGrants, setSelectedGrants] = useState<GrantableScope[]>([])
  const [origin, setOrigin] = useState('')

  useEffect(() => setOrigin(window.location.origin), [])

  const form = useAppForm({
    defaultValues: { name: '', expiry: 'never' as ApiKeyExpiry },
    onSubmit: async ({ value, formApi }) => {
      try {
        const input = { ...value, grants: isAdmin ? selectedGrants : [] }
        const { apiKey, key } = agentUserId ? await createAgentApiKey(agentUserId, input) : await createMyApiKey(input)
        setNewKey({ name: apiKey.name, key })
        setIsCreating(false)
        setSelectedGrants([])
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

  const toggleGrant = async (key: ApiKeyListing, grant: (typeof grants)[number]) => {
    const enable = !has(key, grant.scope)
    if (!confirm(enable ? grant.enableConfirm(key.name) : grant.disableConfirm(key.name))) return
    try {
      await setApiKeyAccess(key.id, grant.scope, enable)
      router.refresh()
    } catch (err: any) {
      toast('Could not change access', err?.message ?? 'Something went wrong', 'error')
    }
  }

  const toggleSelected = (scope: GrantableScope, checked: boolean) =>
    setSelectedGrants((current) => checked ? [...current, scope] : current.filter((s) => s !== scope))

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
        {agentUserId ? ' this agent' : canCreate ? ' you' : ' this user'}, with the same permissions. Keys are read-only unless an admin grants
        more: writing documents and pricing reviews, proposing Canon changes, editing aliases, or, for a shared
        agent like Hermes, acting for people who linked their accounts{agentUserId ? ' in Lumexia' : ' below'}.
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

            {isAdmin && grants.map(grant => (
              <label key={grant.scope} className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox mt-0.5"
                  checked={selectedGrants.includes(grant.scope)}
                  onChange={(e) => toggleSelected(grant.scope, e.target.checked)}
                />
                <span className="flex flex-col">
                  <span className="font-medium">{grant.label}</span>
                  <span className="text-sm text-base-content/60">{grant.description}</span>
                </span>
              </label>
            ))}

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
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="badge badge-soft badge-ghost">Read</span>
                          {grants.filter(grant => has(key, grant.scope)).map(grant => (
                            <span key={grant.scope} className={`badge badge-soft ${grant.badge}`}>{grant.label}</span>
                          ))}
                        </div>
                        {isAdmin && !key.revokedAt && (
                          <div className="dropdown dropdown-end mt-1">
                            <button type="button" tabIndex={0} className="btn btn-xs btn-ghost">Change access</button>
                            <ul tabIndex={0} className="dropdown-content menu z-10 w-60 rounded-box bg-base-100 p-2 shadow">
                              {grants.map(grant => (
                                <li key={grant.scope}>
                                  <button type="button" onClick={() => toggleGrant(key, grant)}>
                                    {has(key, grant.scope) ? `Remove: ${grant.label}` : `Allow: ${grant.label}`}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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
