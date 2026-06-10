'use client'
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import UserIcon from "@/components/UI/UserIcon"
import { UserWithRolesDetail } from "@/actions/users/getUserById"
import { resetUserAvatarFor } from "@/actions/users/admin/resetUserAvatarFor"
import { UserRole } from "@prisma/client"
import RolesPanel from "./RolesPanel"
import { useRouter } from "next/navigation"
import { useState } from "react"

const Row = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-base-content/60">{label}</span>
    <span className="text-base-content">{value || <span className="text-base-content/40">—</span>}</span>
  </div>
)

const ProfilePanel = ({ user, allRoles }: { user: UserWithRolesDetail, allRoles: UserRole[] }) => {

  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)

  const providers = user.accounts.map(a => a.provider)
  const roleNames = user.UserRoleAssignment.map(a => a.userRole.name)

  const handleResetAvatar = async () => {
    setIsResetting(true)
    try {
      await resetUserAvatarFor(user.id)
      router.refresh()
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle>Profile</SectionTitle>

      <Card.Root>
        <div className="flex items-center gap-4">
          <UserIcon image={user.image || ''} name={user.name || ''} />
          <div className="flex flex-col">
            <span className="font-medium text-base-content">{user.name}</span>
            <span className="text-sm text-base-content/70">{user.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Row label="User ID" value={user.id} />
          <Row label="Linked accounts" value={providers.length ? providers.join(', ') : 'None'} />
          <Row label="Created" value={new Date(user.createdAt).toLocaleString()} />
          <Row label="Last updated" value={new Date(user.updatedAt).toLocaleString()} />
          <Row
            label="Roles"
            value={
              roleNames.length ? (
                <div className="flex flex-wrap gap-2">
                  {roleNames.map(name => <span key={name} className="badge badge-primary">{name}</span>)}
                </div>
              ) : 'No roles'
            }
          />
        </div>

        <div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleResetAvatar}
            disabled={isResetting}
          >
            Reset avatar to default
          </button>
        </div>
      </Card.Root>

      <RolesPanel user={user} allRoles={allRoles} />
    </div>
  )
}

export default ProfilePanel
