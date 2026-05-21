'use client'
import { SinglePricingFinishedProduct } from '@/actions/accounting/examinations/getOne'
import DataTable from '@/components/DataTable'
import { SortableHeaderType } from '@/components/DataTable/SortableHeaderType'
import SectionTitle from '@/components/Text/SectionTitle'
import { toFracitonalDigits } from '@/utils/data/toFractionalDigits'
import { createColumnHelper } from '@tanstack/react-table'
import React from 'react'

const ch = createColumnHelper<SinglePricingFinishedProduct>()

const columns = [
  ch.accessor('name', { header: SortableHeaderType('Container') }),
  ch.accessor('fillQuantity', {
    header: SortableHeaderType('Fill Qty'),
    cell: (row) => `${row.getValue()} ${row.row.original.fillUom.abbreviation}`,
  }),
  ch.accessor('declaredQuantity', {
    header: SortableHeaderType('Declared Qty'),
    cell: (row) => `${row.getValue()} ${row.row.original.fillUom.abbreviation}`,
  }),
  ch.accessor('productFillCost', {
    header: SortableHeaderType('Product Fill Cost'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
  ch.accessor('auxiliariesTotalCost', {
    header: SortableHeaderType('Auxiliaries Cost'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
  ch.accessor('difficultyAdjustmentCost', {
    header: SortableHeaderType('Difficulty Cost'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
  ch.accessor('freeShippingCost', {
    header: SortableHeaderType('Free Shipping'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
  ch.accessor('finishedProductTotalCost', {
    header: SortableHeaderType('Total Cost'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
  ch.accessor('markup', {
    header: SortableHeaderType('Markup'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
  ch.accessor('consumerPrice', {
    header: SortableHeaderType('Consumer Price'),
    cell: (row) => toFracitonalDigits.pricingCurrency(row.getValue()),
  }),
]

const ContainerParametersTable = ({ finishedProducts }: { finishedProducts: SinglePricingFinishedProduct[] }) => {
  return (
    <div className='flex flex-col gap-4'>
      <SectionTitle>Container Pricing Parameters</SectionTitle>
      <DataTable.Default
        tableStateName='pricingExamContainers'
        columns={columns}
        data={finishedProducts}
        onRowClick={() => { }}
        disableFilters
      />
    </div>
  )
}

export default ContainerParametersTable
