import PageTitle from "@/components/Text/PageTitle"
import UserIcon from "@/components/UI/UserIcon"
import { getUser } from "@/actions/users/getUser"
import { getUserById } from "@/actions/users/getUserById"
import { getHomeDashLayout } from "@/actions/users/homeDash/getHomeDashLayout"
import userRoleActions from "@/actions/users/userRoles"
import { redirect, notFound } from "next/navigation"
import TabSelector from "./_components/shared/TabSelector"
import TabsContainer from "./_components/shared/TabsContainer"
import ProfilePanel from "./_components/ProfilePanel"
import AccountStatusPanel from "./_components/AccountStatusPanel"
import DangerZonePanel from "./_components/DangerZonePanel"
import DashboardSettings from "@/app/settings/user/_components/DashboardSettings"
import ApiKeysPanel from "@/app/settings/user/_components/ApiKeysPanel"
import { getUserApiKeys } from "@/actions/users/apiKeys"
import LinkedAccountsPanel from "@/app/settings/user/_components/LinkedAccountsPanel"
import { getUserLinkedIdentities } from "@/actions/users/linkedIdentities"

const UserDetailPage = async ({ params }: { params: { id: string } }) => {

  // Access control: only system admins may view user details.
  const currentUser = await getUser()
  if (!currentUser.roles.isSystemAdmin) {
    redirect('/settings')
  }

  const user = await getUserById(params.id)
  if (!user) {
    notFound()
  }

  const roles = await userRoleActions.getAll()
  const homeDashLayout = await getHomeDashLayout(user.id)
  const apiKeys = await getUserApiKeys(user.id)
  const linkedIdentities = await getUserLinkedIdentities(user.id)

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center gap-4">
        <UserIcon image={user.image || ''} name={user.name || ''} />
        <div className="flex flex-col">
          <PageTitle>{user.name ?? 'User'}</PageTitle>
          <span className="text-sm text-base-content/70">{user.email}</span>
        </div>
      </div>

      <TabSelector />
      <TabsContainer
        profile={<ProfilePanel user={user} allRoles={roles} />}
        status={<AccountStatusPanel user={user} />}
        dashboard={<DashboardSettings layout={homeDashLayout} userId={user.id} />}
        agents={
          <div className="flex flex-col gap-8">
            <ApiKeysPanel keys={apiKeys} canCreate={user.id === currentUser.id} isAdmin />
            <LinkedAccountsPanel identities={linkedIdentities} canLink={user.id === currentUser.id} />
          </div>
        }
        danger={<DangerZonePanel user={user} />}
      />
    </div>
  )
}

export default UserDetailPage
