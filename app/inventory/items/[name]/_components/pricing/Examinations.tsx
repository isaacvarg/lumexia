import Card from "@/components/Card"
import DataTable from "@/components/DataTable"
import SectionTitle from "@/components/Text/SectionTitle"
import { useItemSelection } from "@/store/itemSlice"
import { Filter } from "@/types/filter"
import { toFacetFilter } from "@/utils/data/toFacetFilter"
import { useRouter } from "next/navigation"
import { examinationColumns } from "./ExaminationsColumns"
import { getSlug } from "@/utils/general/getSlug"

const Examinations = () => {

  const router = useRouter()
  const { item, examinations } = useItemSelection()


  const filters: Filter[] = [
    {
      columnName: "userName",
      filterLabel: "Conducted By",
      options: toFacetFilter(examinations, "user.id", "user.name"),
    },
  ];

  const handleNew = () => {

    if (!item) return;
    const slugName = getSlug(item.name);

    router.push(`/accounting/pricing/${slugName}/new?id=${item.id}`)
  }

  return (
    <div className="col-span-1 sm:col-span-2 flex flex-col gap-6">
      <div className="flex items-center justify-between">

        <SectionTitle>Examinations</SectionTitle>

        <button onClick={handleNew} className="btn btn-secondary">
          New Examination
        </button>
      </div>


      <Card.Root>

        <DataTable.Default
          data={examinations}
          filters={filters}
          searchBg="elevated"
          columns={examinationColumns}
          onRowClick={(row) => router.push(`/accounting/pricing/details?id=${row.original.id}`)}
          tableStateName='itemPricingExamiantions'
        />

      </Card.Root>

    </div>
  )
}

export default Examinations
