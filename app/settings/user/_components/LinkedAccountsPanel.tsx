'use client'
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import useToast from "@/hooks/useToast"
import type { LinkedIdentityListing } from "@/lib/linkedIdentities"
import { createMyLinkCode, unlinkIdentity } from "@/actions/users/linkedIdentities"
import { DateTime } from "luxon"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbBrandWhatsapp, TbCopy, TbX } from "react-icons/tb"

const formatDate = (date: Date) => DateTime.fromJSDate(date).toLocaleString(DateTime.DATETIME_MED)

const channelLabel: Record<string, string> = { whatsapp: 'WhatsApp' }

type Props = {
  identities: LinkedIdentityListing[]
  // Admins viewing another user can unlink but not link: a link code proves the person is the account owner.
  canLink?: boolean
}

const LinkedAccountsPanel = ({ identities, canLink = true }: Props) => {

  const router = useRouter()
  const { toast } = useToast()
  const [linkCode, setLinkCode] = useState<{ code: string, expiresAt: Date } | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null)

  const handleCreateCode = async () => {
    setIsCreating(true)
    try {
      setLinkCode(await createMyLinkCode('whatsapp'))
    } catch (err: any) {
      toast('Could not create code', err?.message ?? 'Something went wrong', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUnlink = async (identity: LinkedIdentityListing) => {
    if (!confirm(`Unlink +${identity.externalId}? The agent will stop recognizing messages from it as ${canLink ? 'you' : 'this user'}.`)) return
    setUnlinkingId(identity.id)
    try {
      await unlinkIdentity(identity.id)
      router.refresh()
    } catch (err: any) {
      toast('Could not unlink', err?.message ?? 'Something went wrong', 'error')
    } finally {
      setUnlinkingId(null)
    }
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast('Copied', 'Copied to clipboard.', 'success')
    } catch {
      toast('Copy failed', 'Could not copy to clipboard.', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <SectionTitle>Linked Accounts</SectionTitle>
        {canLink && (
          <button type="button" className="btn btn-secondary" disabled={isCreating} onClick={handleCreateCode}>
            <TbBrandWhatsapp className="w-5 h-5" /> Link WhatsApp
          </button>
        )}
      </div>

      <p className="text-base-content/70">
        Link a WhatsApp number so the company agent (Hermes) knows messages from it are from
        {canLink ? ' you' : ' this user'}. Approvals made over WhatsApp are then recorded under
        {canLink ? ' your' : ' their'} name.
      </p>

      {linkCode && (
        <Card.Root>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base-content">Send this code to Hermes from your phone</span>
              <span className="text-sm text-base-content/70">
                Message it something like &ldquo;link my account {linkCode.code}&rdquo;. The code works once and
                expires at {DateTime.fromJSDate(linkCode.expiresAt).toLocaleString(DateTime.TIME_SIMPLE)}.
              </span>
            </div>
            <button type="button" className="btn btn-ghost btn-square" aria-label="Dismiss" onClick={() => { setLinkCode(null); router.refresh() }}>
              <TbX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-base-200 p-3 text-center text-2xl tracking-widest">{linkCode.code}</code>
            <button type="button" className="btn btn-ghost btn-square" aria-label="Copy code" onClick={() => copy(linkCode.code)}>
              <TbCopy className="w-5 h-5" />
            </button>
          </div>
        </Card.Root>
      )}

      <Card.Root>
        {identities.length === 0 ? (
          <p className="text-base-content/70">No linked accounts.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Number</th>
                  <th>Linked through</th>
                  <th>Linked</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {identities.map(identity => (
                  <tr key={identity.id}>
                    <td className="font-medium">{channelLabel[identity.channel] ?? identity.channel}</td>
                    <td><code className="text-sm">+{identity.externalId}</code></td>
                    <td>{identity.apiKey?.name ?? '—'}</td>
                    <td>{formatDate(identity.createdAt)}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline btn-error"
                        disabled={unlinkingId === identity.id}
                        onClick={() => handleUnlink(identity)}
                      >
                        Unlink
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card.Root>
    </div>
  )
}

export default LinkedAccountsPanel
