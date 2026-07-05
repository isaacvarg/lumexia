import { usePricingSharedSelection } from "@/store/pricingSharedSlice"
import ProductButton from "./ProductButton";
import SelectedProduct from "./SelectedProduct";

const NormalMode = () => {

  const { finishedProducts } = usePricingSharedSelection()

  if (!finishedProducts || finishedProducts.length === 0) return false;


  return (
    <div className="flex flex-col gap-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {finishedProducts.map(fp => <ProductButton key={fp.id} finishedProduct={fp} />)}
      </div>


      <SelectedProduct />



    </div>
  )
}

export default NormalMode
