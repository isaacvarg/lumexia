'use client'
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import { UserWithRolesDetail } from "@/actions/users/getUserById"
import { setUserDisabled } from "@/actions/users/admin/setUserDisabled"
import { revokeUserSessions } from "@/actions/users/admin/revokeUserSessions"
import { useRouter } from "next/navigation"
import { useState } from "react"

const AccountStatusPanel = ({ user }: { user: UserWithRolesDetail }) => {

  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle>Account Status</SectionTitle>

      <Card.Root>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-base-content">Status</span>
            <span className="text-sm text-base-content/70">
              {user.disabled
                ? 'This account is disabled and cannot sign in.'
                : 'This account is active.'}
            </span>
          </div>
          <span className={`badge badge-lg ${user.disabled ? 'badge-error' : 'badge-success'}`}>
            {user.disabled ? 'Disabled' : 'Active'}
          </span>
        </div>

        {error && <p className="text-error">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={`btn ${user.disabled ? 'btn-success' : 'btn-error'}`}
            disabled={busy}
            onClick={() => run(() => setUserDisabled(user.id, !user.disabled))}
          >
            {user.disabled ? 'Reactivate account' : 'Disable account'}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            disabled={busy}
            onClick={() => run(() => revokeUserSessions(user.id))}
          >
            Force sign-out
          </button>
        </div>
      </Card.Root>
    </div>
  )
}

export default AccountStatusPanel
