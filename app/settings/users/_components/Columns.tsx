import { createColumnHelper, FilterFn } from "@tanstack/react-table"
import { UserWithRoles } from "@/actions/users/getAllUsers"
import UserIcon from "@/components/UI/UserIcon"

const columnHelper = createColumnHelper<UserWithRoles>()

// A user has many roles; keep a row visible if any selected role id is among the
// user's role ids (intersection), rather than the default single-value match.
const roleFilterFn: FilterFn<UserWithRoles> = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true
  const roleIds = row.getValue(columnId) as string[]
  return filterValue.some((value: string) => roleIds.includes(value))
}

export const userColumns = [
  columnHelper.accessor("name", {
    header: "User",
    cell: (row) => {
      const user = row.row.original
      return (
        <div className="flex items-center gap-x-3">
          <UserIcon image={user.image || ''} name={user.name || ''} />
          <span>{user.name}</span>
        </div>
      )
    },
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor((user) => user.UserRoleAssignment.map((assignment) => assignment.userRoleId), {
    id: 'roles',
    header: "Roles",
    filterFn: roleFilterFn,
    cell: (row) => {
      const assignments = row.row.original.UserRoleAssignment
      if (assignments.length === 0) {
        return <span className="text-base-content/50">No roles</span>
      }
      return (
        <div className="flex flex-wrap gap-2">
          {assignments.map((assignment) => (
            <span key={assignment.id} className="badge badge-primary">{assignment.userRole.name}</span>
          ))}
        </div>
      )
    },
  }),
]
