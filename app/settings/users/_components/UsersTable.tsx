'use client'
import DataTable from "@/components/DataTable"
import { Filter } from "@/types/filter"
import { toTableFilter } from "@/utils/data/toTableFilter"
import { useRouter } from "next/navigation"
import { UserRole } from "@prisma/client"
import { UserWithRoles } from "@/actions/users/getAllUsers"
import { userColumns } from "./Columns"

type Props = {
  users: UserWithRoles[]
  roles: UserRole[]
}

const UsersTable = ({ users, roles }: Props) => {

  const router = useRouter()

  const filters: Filter[] = [
    {
      columnName: "roles",
      filterLabel: "Role",
      options: toTableFilter(roles, (role) => role.id, (role) => role.name),
    },
  ]

  return (
    <DataTable.Default
      tableStateName='users'
      columns={userColumns}
      data={users}
      filters={filters}
      initialSortBy={[{ id: 'name', desc: false }]}
      onRowClick={(row) => router.push(`/settings/users/${row.original.id}`)}
    />
  )
}

export default UsersTable
