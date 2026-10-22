'use client'
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import useToast from "@/hooks/useToast"
import type { LinkedIdentityListing } from "@/lib/linkedIdentities"
import { formatExternalId, identityChannelInfo, identityChannels, type IdentityChannel } from "@/lib/identityChannels"
import { createMyLinkCode, unlinkIdentity } from "@/actions/users/linkedIdentities"
import { DateTime } from "luxon"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbBrandDiscord, TbBrandSlack, TbBrandTelegram, TbBrandWhatsapp, TbCopy, TbLink, TbRobot, TbX } from "react-icons/tb"

const formatDate = (date: Date) => DateTime.fromJSDate(date).toLocaleString(DateTime.DATETIME_MED)

const channelIcon: Record<IdentityChannel, React.ComponentType<{ className?: string }>> = {
  whatsapp: TbBrandWhatsapp,
  discord: TbBrandDiscord,
  telegram: TbBrandTelegram,
  slack: TbBrandSlack,
  hermes: TbRobot,
}

// What to do with the code on each channel.
const sendInstructions: Record<IdentityChannel, string> = {
  whatsapp: 'Send it to Hermes on WhatsApp from your phone',
  discord: 'Send it to the bot in a Discord DM',
  telegram: 'Send it to the bot in a Telegram DM',
  slack: 'Send it to the bot in a Slack DM',
  hermes: 'Send it to Hermes in a desktop or CLI session of the profile you want to link',
}

const channels = Object.values(identityChannels)
const label = (channel: string) => identityChannelInfo[channel as IdentityChannel]?.label ?? channel

type Props = {
  identities: LinkedIdentityListing[]
  // Admins viewing another user can unlink but not link: a link code proves the person is the account owner.
  canLink?: boolean
}

const LinkedAccountsPanel = ({ identities, canLink = true }: Props) => {

  const router = useRouter()
  const { toast } = useToast()
  const [linkCode, setLinkCode] = useState<{ code: string, expiresAt: Date, channel: IdentityChannel } | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null)

  const handleCreateCode = async (channel: IdentityChannel) => {
    setIsCreating(true)
    try {
      setLinkCode({ ...(await createMyLinkCode(channel)), channel })
    } catch (err: any) {
      toast('Could not create code', err?.message ?? 'Something went wrong', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUnlink = async (identity: LinkedIdentityListing) => {
    if (!confirm(`Unlink ${label(identity.channel)} ${formatExternalId(identity.channel, identity.externalId)}? The agent will stop recognizing messages from it as ${canLink ? 'you' : 'this user'}.`)) return
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
          <div className="dropdown dropdown-end">
            <button type="button" tabIndex={0} className="btn btn-secondary" disabled={isCreating}>
              <TbLink className="w-5 h-5" /> Link account
            </button>
            <ul tabIndex={0} className="dropdown-content menu z-10 w-52 rounded-box bg-base-100 p-2 shadow">
              {channels.map(channel => {
                const Icon = channelIcon[channel]
                return (
                  <li key={channel}>
                    <button type="button" onClick={() => handleCreateCode(channel)}>
                      <Icon className="w-5 h-5" /> {identityChannelInfo[channel].label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      <p className="text-base-content/70">
        Link your chat accounts (WhatsApp, Discord, Telegram, Slack) or a Hermes profile so the company agent knows
        messages from them are from{canLink ? ' you' : ' this user'}. Actions it takes for
        {canLink ? ' you' : ' them'}, like approving pricing or proposing Canon changes, are then recorded under
        {canLink ? ' your' : ' their'} name. You can link as many as you like.
      </p>

      {linkCode && (
        <Card.Root>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base-content">{sendInstructions[linkCode.channel]}</span>
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
                  <th>Account</th>
                  <th>Linked through</th>
                  <th>Linked</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {identities.map(identity => (
                  <tr key={identity.id}>
                    <td className="font-medium">{label(identity.channel)}</td>
                    <td><code className="text-sm">{formatExternalId(identity.channel, identity.externalId)}</code></td>
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
