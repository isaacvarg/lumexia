import { accountingActions } from "@/actions/accounting"
import PageTitle from "@/components/Text/PageTitle"
import PricingTemplatesTable from "./_components/Table";
import HelperSetter from "@/components/Helper/HelperSetter";

const PricingTemplatesPage = async () => {

  const templates = await accountingActions.finishedProducts.templates.getAllTemplates();
  return (
    <div className="flex flex-col gap-y-4">

      <HelperSetter section="accounting-pricing-templates" />

      <PageTitle>Pricing Templates</PageTitle>


      <PricingTemplatesTable templates={templates} />

    </div>

  )
}

export default PricingTemplatesPage
