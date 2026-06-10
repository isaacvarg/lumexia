import PageTitle from "@/components/Text/PageTitle"
import { getUser } from "@/actions/users/getUser"
import { getAllUsers } from "@/actions/users/getAllUsers"
import userRoleActions from "@/actions/users/userRoles"
import { redirect } from "next/navigation"
import UsersTable from "./_components/UsersTable"

const ManageUsersPage = async () => {

  // Access control: only system admins may manage users. The settings button is
  // hidden for non-admins, but guard the route server-side too.
  const user = await getUser()
  if (!user.roles.isSystemAdmin) {
    redirect('/settings')
  }

  const users = await getAllUsers()
  const roles = await userRoleActions.getAll()

  return (
    <div className="flex flex-col gap-y-6">
      <PageTitle>Manage Users</PageTitle>

      <UsersTable users={users} roles={roles} />
    </div>
  )
}

export default ManageUsersPage
