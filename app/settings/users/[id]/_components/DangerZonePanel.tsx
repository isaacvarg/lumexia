'use client'
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import { UserWithRolesDetail } from "@/actions/users/getUserById"
import { deactivateUserAccount } from "@/actions/users/admin/deactivateUserAccount"
import { useRouter } from "next/navigation"
import { useState } from "react"

const DangerZonePanel = ({ user }: { user: UserWithRolesDetail }) => {

  const router = useRouter()
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmTarget = user.email ?? ''
  const canConfirm = confirm.trim() === confirmTarget && confirmTarget !== ''

  const handleDeactivate = async () => {
    setBusy(true)
    setError(null)
    try {
      await deactivateUserAccount(user.id)
      router.push('/settings/users')
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle>Danger Zone</SectionTitle>

      <div className="rounded-xl border border-error/50 bg-error/5 p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-error">Permanently deactivate account</span>
          <span className="text-sm text-base-content/70">
            Disables the account, revokes all active sessions, and unlinks their OAuth logins. The user
            will lose all access until an admin reactivates them. This does not delete their historical
            records.
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-base-content/70">
            Type <span className="font-mono font-medium text-base-content">{confirmTarget}</span> to confirm
          </label>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input input-bordered w-full max-w-md"
            placeholder={confirmTarget}
          />
        </div>

        {error && <p className="text-error">{error}</p>}

        <div>
          <button
            type="button"
            className="btn btn-error"
            disabled={!canConfirm || busy}
            onClick={handleDeactivate}
          >
            Permanently deactivate account
          </button>
        </div>
      </div>
    </div>
  )
}

export default DangerZonePanel
