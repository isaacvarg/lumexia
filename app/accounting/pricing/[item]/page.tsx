import PageTitle from "@/components/Text/PageTitle";
import ActionBar from "./_components/ActionBar";
import { getItem } from "./_functions/getItem"
import PageBreadcrumbs from "@/components/App/PageBreadcrumbs";
import { accountingActions } from "@/actions/accounting";
import LastExaminedPanel from "./_components/LastExaminedPanel";
import ExaminationsTable from "./_components/ExaminationsTable";
import OverallItemPriceChart from "./_components/OverallItemPriceChart";
import OverallMbprPricingChart from "./_components/OverallMbprPricingChart";
import BomPricingChart from "./_components/BomPricingChart";
import { getProducedPricingByItem } from "./_functions/getProducedPricingExamination";
import FinishedProductsChart from "./_components/FinishedProductChart";
import { procurementTypes } from "@/configs/staticRecords/procurementTypes";
import HelperSetter from "@/components/Helper/HelperSetter";

interface ItemPricingDashboardProps {
  searchParams: {
    id: string
  }
}

const ItemPricingDashboard = async ({ searchParams }: ItemPricingDashboardProps) => {

  const item = await getItem(searchParams.id);

  const examinations = await accountingActions.examinations.getAllByItem(searchParams.id);
  const isProduced = item.procurementTypeId === procurementTypes.produced;
  const producedExaminations = await getProducedPricingByItem(item.id)


  return (
    <div className="flex flex-col gap-y-4">

      <HelperSetter section="accounting-pricing-item" />

      <PageTitle>Pricing Overview - {item.name}</PageTitle>
      <PageBreadcrumbs />

      <ActionBar itemId={item.id} itemName={item.name} />

      <div className="grid grid-cols-3 gap-4">
        <LastExaminedPanel lastExamination={examinations[0] || null} />
        {!isProduced && <OverallItemPriceChart pricingExaminations={examinations} />}
        {isProduced && <OverallMbprPricingChart examinations={producedExaminations} />}
        <FinishedProductsChart examinations={examinations} />
      </div>

      {isProduced && <BomPricingChart examinations={producedExaminations} />}

      <ExaminationsTable pricingExaminations={examinations} />
    </div>
  )
}

export default ItemPricingDashboard 
