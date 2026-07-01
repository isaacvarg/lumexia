'use client'
import DataTable from '@/components/DataTable'
import { Filter } from '@/types/filter'
import { toFacetFilter } from '@/utils/data/toFacetFilter'
import { useRouter } from 'next/navigation'
import { useBprPlanningSelection } from '@/store/bprPlanningSlice'
import { AllPlanningBpr } from '@/actions/production/getAllPlanningBprs'
import { columns } from '../Columns'

const TableTab = () => {
  const router = useRouter()
  const { allBprs } = useBprPlanningSelection()

  const handleClick = (row: AllPlanningBpr) => {
    const { referenceCode, id } = row
    router.push(`/production/planning/${referenceCode}?id=${id}`)
  }

  const filters: Filter[] = [
    {
      columnName: 'producedItemName',
      filterLabel: 'Item',
      options: toFacetFilter(allBprs, 'producedItemName', 'producedItemName'),
    },
    {
      columnName: 'bprStatusName',
      filterLabel: 'Status',
      options: toFacetFilter(allBprs, 'bprStatusName', 'bprStatusName'),
    },
    {
      columnName: 'waitingOnTeam',
      filterLabel: 'Waiting On',
      options: toFacetFilter(allBprs, 'waitingOnTeam', 'waitingOnTeam'),
    },
  ]

  return (
    <DataTable.Default
      data={allBprs}
      filters={filters}
      columns={columns}
      onRowClick={(row) => handleClick(row.original)}
      tableStateName='productionPlanningList'
      initialSortBy={[{ id: 'referenceCode', desc: true }]}
    />
  )
}

export default TableTab
