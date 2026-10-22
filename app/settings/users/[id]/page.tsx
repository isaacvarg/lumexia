import PageTitle from "@/components/Text/PageTitle"
import UserIcon from "@/components/UI/UserIcon"
import UserKindBadge from "@/components/UI/UserKindBadge"
import { userKinds } from "@/lib/userKinds"
import { getUser } from "@/actions/users/getUser"
import { getUserById } from "@/actions/users/getUserById"
import { getHomeDashLayout } from "@/actions/users/homeDash/getHomeDashLayout"
import userRoleActions from "@/actions/users/userRoles"
import { redirect, notFound } from "next/navigation"
import TabSelector from "./_components/shared/TabSelector"
import TabsContainer from "./_components/shared/TabsContainer"
import ProfilePanel from "./_components/ProfilePanel"
import AgentProfilePanel from "./_components/AgentProfilePanel"
import SystemUserPanel from "./_components/SystemUserPanel"
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
  const header = (
    <div className="flex items-center gap-4">
      <UserIcon kind={user.kind} image={user.image || ''} name={user.name || ''} />
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <PageTitle>{user.name ?? 'User'}</PageTitle>
          <UserKindBadge kind={user.kind} />
        </div>
        <span className="text-sm text-base-content/70">{user.kind === userKinds.human ? user.email : user.description}</span>
      </div>
    </div>
  )

  // The system user is read-only: scheduled jobs act as it.
  if (user.kind === userKinds.system) {
    return (
      <div className="flex flex-col gap-y-6">
        {header}
        <SystemUserPanel user={user} />
      </div>
    )
  }

  const apiKeys = await getUserApiKeys(user.id)

  // Agents never sign in: no dashboard, linked accounts or deactivation; an admin creates their keys.
  if (user.kind === userKinds.agent) {
    return (
      <div className="flex flex-col gap-y-6">
        {header}
        <TabSelector tabs={['profile', 'status', 'agents']} />
        <TabsContainer
          profile={<AgentProfilePanel user={user} allRoles={roles} />}
          status={<AccountStatusPanel user={user} />}
          agents={<ApiKeysPanel keys={apiKeys} canCreate={!user.disabled} isAdmin agentUserId={user.id} />}
        />
      </div>
    )
  }

  const homeDashLayout = await getHomeDashLayout(user.id)
  const linkedIdentities = await getUserLinkedIdentities(user.id)

  return (
    <div className="flex flex-col gap-y-6">
      {header}

      <TabSelector tabs={['profile', 'status', 'dashboard', 'agents', 'danger']} />
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
