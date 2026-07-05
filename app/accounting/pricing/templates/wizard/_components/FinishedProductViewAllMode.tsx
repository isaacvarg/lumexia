import { ExistingFinishedProduct, usePricingTemplateWizardActions, usePricingTemplateWizardSelection } from "@/store/pricingTemplateWizardSlice"
const styles = "bg-neutral-200 p-6 rounded-xl font-poppins text-xl font-semibold hover:cursor-pointer hover:bg-neutral-300"
const FinishedProductViewAllMode = () => {

    const { finishedProductStepMode, existingFinishedProducts } = usePricingTemplateWizardSelection()
    const { setFinishedProductStepMode, setSelectedFinishedProduct } = usePricingTemplateWizardActions()

    const handleClick = (product: ExistingFinishedProduct) => {
        setSelectedFinishedProduct(product)
        setFinishedProductStepMode('view');
    }

    if (finishedProductStepMode !== 'all') return false;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                className={styles}
                onClick={() => setFinishedProductStepMode('add')}
            >
                Add New
            </div>
            {existingFinishedProducts.map(fp => {
                return (
                    <div key={fp.id}
                        onClick={() => handleClick(fp)}
                        className={styles}
                    >
                        {fp.name}
                    </div>
                )
            })}
        </div>

    )
}

export default FinishedProductViewAllMode
