'use client'

import Card from '@/components/Card'
import DataTable from '@/components/DataTable'
import useDialog from '@/hooks/useDialog'
import { useState } from 'react'
import { ActionableTypeRow } from '../_actions/getActionableTypes'
import { ActionableTypesTableColumns } from './ActionableTypesTableColumns'
import ActionableTypeForm from './ActionableTypeForm'
import { Filter } from '@/types/filter'
import { toFacetFilter } from '@/utils/data/toFacetFilter'
import { UserRole } from '@prisma/client'

const ActionableTypesTable = ({
  actionableTypes,
  userRoles,
}: {
  actionableTypes: ActionableTypeRow[]
  userRoles: UserRole[]
}) => {
  const { showDialog } = useDialog()
  const [selected, setSelected] = useState<ActionableTypeRow | null>(null)

  const filters: Filter[] = [
    {
      columnName: 'dataType',
      filterLabel: 'Data Type',
      options: toFacetFilter(actionableTypes, 'dataType', 'dataType'),
    },
    {
      columnName: 'userRole.name',
      filterLabel: 'Role',
      options: toFacetFilter(actionableTypes, 'userRole.name', 'userRole.name'),
    },
  ]

  return (
    <Card.Root>
      <ActionableTypeForm selected={selected} userRoles={userRoles} />

      <div className='flex justify-between items-center'>
        <Card.Title>Step Actionable Types</Card.Title>
        <button
          className='btn btn-neutral'
          onClick={() => {
            setSelected(null)
            showDialog('actionableType')
          }}
        >
          Add Type
        </button>
      </div>

      <DataTable.Default
        tableStateName='actionableTypes'
        columns={ActionableTypesTableColumns}
        data={actionableTypes}
        filters={filters}
        onRowClick={(row) => {
          setSelected(row.original)
          showDialog('actionableType')
        }}
      />
    </Card.Root>
  )
}

export default ActionableTypesTable
