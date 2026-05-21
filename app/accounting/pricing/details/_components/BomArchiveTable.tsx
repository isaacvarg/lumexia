'use client'
import { SinglePricingExaminationCombined } from '@/actions/accounting/examinations/getOne'
import DataTable from '@/components/DataTable'
import { SortableHeaderType } from '@/components/DataTable/SortableHeaderType'
import SectionTitle from '@/components/Text/SectionTitle'
import { toFracitonalDigits } from '@/utils/data/toFractionalDigits'
import { createColumnHelper } from '@tanstack/react-table'
import React from 'react'

type BomRow = SinglePricingExaminationCombined['BomPricingDataArchive'][number]

const ch = createColumnHelper<BomRow>()

const columns = [
  ch.accessor('item.name', { header: SortableHeaderType('Item') }),
  ch.accessor('materialPrice', {
    header: SortableHeaderType('Material Price'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
  ch.accessor('arrivalCost', {
    header: SortableHeaderType('Arrival Cost'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
  ch.accessor('productionUsageCost', {
    header: SortableHeaderType('Production Usage'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
  ch.accessor('unforeseenDifficultiesCost', {
    header: SortableHeaderType('Unforeseen Difficulties'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
  ch.accessor('overallItemCostPerLb', {
    header: SortableHeaderType('Overall $/lb'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
  ch.accessor('totalMaterialCost', {
    header: SortableHeaderType('Total Material Cost'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
]

const BomArchiveTable = ({ rows }: { rows: BomRow[] }) => {
  return (
    <div className='flex flex-col gap-4'>
      <SectionTitle>BOM Pricing (This Examination)</SectionTitle>
      <DataTable.Default
        tableStateName='pricingExamBomArchive'
        columns={columns}
        data={rows}
        onRowClick={() => { }}
        disableFilters
        initialSortBy={[{ id: 'overallItemCostPerLb', desc: true }]}
      />
    </div>
  )
}

export default BomArchiveTable
