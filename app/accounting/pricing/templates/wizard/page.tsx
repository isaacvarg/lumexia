'use client'
import PageBreadcrumbs from "@/components/App/PageBreadcrumbs"
import PageTitle from "@/components/Text/PageTitle"
import { Wizard } from "@/components/Wizard"
import StateSetter from "./_components/StateSetter"
import StepPricingTemplate from "./_components/StepPricingTemplate"
import { Panels } from "@/components/Panels"
import StepFinishedProduct from "./_components/StepFinishedProduct"
import { usePricingTemplateWizardSelection } from "@/store/pricingTemplateWizardSlice"
import HelperSetter from "@/components/Helper/HelperSetter"

type Props = {
    searchParams: {
        isExisting: boolean;
        templateId?: string | null;
    };
};


const PricingTemplateWizard = ({ searchParams }: Props) => {

    const { isExisting, templateId } = searchParams;

    const { step } = usePricingTemplateWizardSelection()
    return (
        <div className="flex flex-col gap-y-4">

            <HelperSetter section="accounting-pricing-templates" />

            <PageTitle>Pricing Templates</PageTitle>
            <PageBreadcrumbs />
            <StateSetter isExisting={isExisting} templateId={templateId} />

            <Wizard.Steps>
                <Wizard.StepLabel label="Template" indicator="1" step={0} currentStep={step} />

                <Wizard.StepLabel label="Finished Product" indicator="2" step={1} currentStep={step} />

                <Wizard.StepLabel label="Submission" indicator="3" step={2} currentStep={step} />
            </Wizard.Steps>



            <Panels.Root>
                <StepPricingTemplate />
                <StepFinishedProduct />

            </Panels.Root>





        </div>

    )
}

export default PricingTemplateWizard
