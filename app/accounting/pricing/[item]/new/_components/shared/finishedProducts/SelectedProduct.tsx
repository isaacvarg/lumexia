import SectionTitle from "@/components/Text/SectionTitle";
import { usePricingSharedActions, usePricingSharedSelection } from "@/store/pricingSharedSlice"
import PriceAltering from "./PriceAltering";
import Card from "@/components/Card";
import Outputs from "./Outputs";
import { TbEdit, TbTrash } from "react-icons/tb";
import Notes from "../notes/Notes";
import { accountingActions } from "@/actions/accounting";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import useDialog from "@/hooks/useDialog";

const SelectedProduct = () => {

  const { selectedFinishedProduct } = usePricingSharedSelection()
  const { setModifyMode, setFinishedProductsMode, setSelectedFinishedProduct } = usePricingSharedActions()
  const router = useRouter()
  const { showDialog, resetDialogContext } = useDialog()

  if (!selectedFinishedProduct) return false;

  const handleDelete = async () => {
    await accountingActions.finishedProducts.delete(selectedFinishedProduct.id)
    resetDialogContext()
    setSelectedFinishedProduct(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex justify-between items-center">
        <SectionTitle>{selectedFinishedProduct.name}</SectionTitle>
        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-secondary"
            onClick={() => {
              setModifyMode('edit')
              setFinishedProductsMode('modify')
            }}
          ><TbEdit className={'size-6'} /></button>
          <button
            className="btn btn-outline btn-error"
            onClick={() => showDialog('archiveFinishedProduct')}
          >
            <TbTrash className="size-6" />
          </button>
        </div>
      </div>

      <Alert.Root identifier="archiveFinishedProduct">
        <Alert.Content
          title="Archive Finished Product"
          action={handleDelete}
          actionLabel="Archive"
          actionColor="error"
          cancelAction={resetDialogContext}
        >
          Are you sure you want to archive &quot;{selectedFinishedProduct.name}&quot;? It will be hidden from pricing and verification.
        </Alert.Content>
      </Alert.Root>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">

        <div className="flex flex-col gap-6 col-span-1">
          <Card.Root>
            <PriceAltering />
          </Card.Root>
          <Card.Root>
            <Notes />
          </Card.Root>
        </div>

        <div className="col-span-1 sm:col-span-2">

          <Outputs />
        </div>
      </div>


    </div>
  )
}

export default SelectedProduct
