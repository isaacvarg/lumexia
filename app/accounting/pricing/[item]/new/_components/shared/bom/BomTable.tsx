'use client'
import DataTable from "@/components/DataTable"
import { usePricingProducedSelection } from "@/store/pricingProducedSlice"
import { BatchSummations } from "../../../_actions/getBomPricingSummations"
import { PricingError } from "../../../_actions/throwPricingError"
import { bomColumns } from "./BomColumns"

const BomTable = () => {
  const { pricingData } = usePricingProducedSelection()

  // No produced pricing data at all (e.g. purchased item) — nothing to show.
  if (!pricingData) return null

  // The BOM couldn't be built — surface the actual reason instead of a blank tab.
  if (pricingData.isError) {
    const err = pricingData as PricingError
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm">
        <p className="font-medium text-red-700">Unable to build the Bill of Materials</p>
        <p className="mt-1 text-gray-600">{err.message}</p>
        {err.data && err.data.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-gray-600">
            {err.data.map((d) => <li key={d}>{d}</li>)}
          </ul>
        )}
      </div>
    )
  }

  const summations = pricingData as BatchSummations

  const sortedBom = [...summations.bomWithCost].sort((a, b) => {
    return a.identifier.localeCompare(b.identifier, undefined, { numeric: true })
  })

  return (
    <DataTable.Default
      data={sortedBom}
      columns={bomColumns}
      onRowClick={() => {}}
      tableStateName="pricingBom"
      disableFilters
      initialSortBy={[{ id: "identifier", desc: false }]}
    />
  )
}

export default BomTable
