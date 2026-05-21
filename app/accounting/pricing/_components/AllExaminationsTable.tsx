'use client'
import { PricingExaminationAll } from '@/actions/accounting/examinations/getAll'
import DataTable from '@/components/DataTable'
import React from 'react'
import { latestExaminationsColumns } from './LatestExaminationsColumns'
import { Filter } from '@/types/filter'
import { toFacetFilter } from '@/utils/data/toFacetFilter'
import { useRouter } from 'next/navigation'

const AllExaminationsTable = ({ examinations }: { examinations: PricingExaminationAll[] }) => {

    const router = useRouter()
    const filters: Filter[] = [
        {
            columnName: "status",
            filterLabel: "Status",
            options: toFacetFilter(examinations, "status.name", "status.name"),
        },
    ]

    return (
        <div>
            <DataTable.Default
                tableStateName='allPricingExaminations'
                columns={latestExaminationsColumns}
                data={examinations}
                filters={filters}
                onRowClick={(row) => router.push(`/accounting/pricing/details?id=${row.original.id}`)}
            />
        </div>
    )
}

export default AllExaminationsTable
