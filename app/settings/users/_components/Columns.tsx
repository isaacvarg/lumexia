import { createColumnHelper, FilterFn } from "@tanstack/react-table"
import { UserWithRoles } from "@/actions/users/getAllUsers"
import UserIcon from "@/components/UI/UserIcon"
import UserKindBadge from "@/components/UI/UserKindBadge"

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
          <UserIcon kind={user.kind} image={user.image || ''} name={user.name || ''} />
          <span>{user.name}</span>
          <UserKindBadge kind={user.kind} />
        </div>
      )
    },
  }),
  // Agents and the system user have no email; show what they are instead.
  columnHelper.accessor((user) => user.email || user.description, {
    id: 'email',
    header: "Email",
  }),
  columnHelper.accessor("kind", {
    header: "Kind",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: (row) => <span className="capitalize">{row.getValue()}</span>,
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
