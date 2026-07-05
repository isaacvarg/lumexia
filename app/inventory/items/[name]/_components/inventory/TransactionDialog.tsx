import { inventoryActions } from "@/actions/inventory"
import transactionActions from "@/actions/inventory/transactions"
import { getUserId } from "@/actions/users/getUserId"
import Dialog from "@/components/Dialog"
import { Panels } from "@/components/Panels"
import SectionTitle from "@/components/Text/SectionTitle"
import { UnmanagedForm } from "@/components/UnmanagedForm"
import { transactionTypes } from "@/configs/staticRecords/transactionTypes"
import { uom } from "@/configs/staticRecords/unitsOfMeasurement"
import useDialog from "@/hooks/useDialog"
import { useItemSelection } from "@/store/itemSlice"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type TransactionMode = 'set' | 'add' | 'remove' | 'zero'

const { adjustmentRemoval, adjustmentAddition } = transactionTypes;

const TransactionDialog = () => {

  const { selectedLot } = useItemSelection()
  const [transactionMode, setTransactionMode] = useState<TransactionMode>('set');
  const [input, setInput] = useState("0");
  const [newAmount, setNewAmount] = useState<number>(0);
  const { resetDialogContext } = useDialog()
  const router = useRouter();

  const handleCancel = () => {
    resetDialogContext();
    setTransactionMode('set');
    setNewAmount(0);
    setInput('0');
  }

  const handleSubmit = async () => {
    if (!selectedLot) return;

    const userId = await getUserId();
    const currentAmount = selectedLot.totalQuantityOnHand;

    const transactionTypeId =
      newAmount - currentAmount < 0
        ? adjustmentRemoval
        : adjustmentAddition
    const adjustmentQuantity = Math.abs(newAmount - currentAmount)


    await inventoryActions.transactions.create({
      lotId: selectedLot.id,
      transactionTypeId,
      userId,
      uomId: uom.pounds,
      amount: adjustmentQuantity,
      systemNote: 'Adjusted via Inventory Lot Details Transaction Tool',
      userNote: ""
    })


    await createActivityLog('modifyInventoryQuantity', 'lotId', selectedLot.id, {
      context: `Changed quantity from ${currentAmount} to ${newAmount} via Inventory Lot Details Transaction`
    });

    router.refresh();
    resetDialogContext();
    setTransactionMode('set');
    setNewAmount(0);
    setInput('0');

  }

  useEffect(() => {
    if (!selectedLot) return;

    const mathAmount = parseFloat(input);
    const currentAmount = selectedLot.totalQuantityOnHand;

    switch (transactionMode) {
      case 'set':
        setNewAmount(mathAmount)
        break;
      case 'add':
        setNewAmount(currentAmount + mathAmount);
        break;
      case 'remove':
        setNewAmount(currentAmount - mathAmount);
        break;
      case "zero":
        setNewAmount(0);
        setInput('0')
        break;
      default:
        break;
    }
  }, [input, transactionMode, selectedLot])

  if (!selectedLot) return false;

  return (
    <Dialog.Root identifier="transactionDialog">
      <Dialog.Title>Create Transaction</Dialog.Title>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <Panels.Root bg="elevated" >
          <SectionTitle size="small">Current Amount</SectionTitle>
          <div className="flex flex-col items-center justify-center">
            <div className="flex gap-x-2 items-end">      <h1
              className="font-poppins text-4xl font-semibold text-base-content"
            >{toFracitonalDigits.weight(selectedLot.totalQuantityOnHand)}</h1>
              <p className="font-poppins text-base-content/50 text-lg font-semibold">lbs</p>
            </div>
          </div>

        </Panels.Root>
        <Panels.Root bg="elevated" >
          <SectionTitle size="small">New Amount</SectionTitle>

          <div className="flex flex-col items-center justify-center">
            <div className="flex gap-x-2 items-end">
              <h1
                className="font-poppins text-4xl font-semibold text-base-content"
              >{toFracitonalDigits.weight(newAmount)}</h1>
              <p className="font-poppins text-base-content/50 text-lg font-semibold">lbs</p>
            </div>
          </div>
        </Panels.Root>


        <div className="flex flex-wrap gap-3 items-center col-span-1 sm:col-span-2">
          <button className={`btn ${transactionMode === 'set' ? '' : 'btn-outline'} btn-accent flex-1 min-w-[8rem] sm:flex-none sm:min-w-40 `} onClick={() => setTransactionMode('set')}>Set New Amount</button>
          <button className={`btn ${transactionMode === 'add' ? '' : 'btn-outline'} btn-success flex-1 min-w-[8rem] sm:flex-none sm:min-w-40 `} onClick={() => setTransactionMode('add')}>Add To</button>
          <button className={`btn ${transactionMode === 'remove' ? '' : 'btn-outline'} btn-error flex-1 min-w-[8rem] sm:flex-none sm:min-w-40 `} onClick={() => setTransactionMode('remove')}>Remove From</button>
          <button className={`btn ${transactionMode === 'zero' ? '' : 'btn-outline '} btn-warning flex-1 min-w-[8rem] sm:flex-none sm:min-w-40 `} onClick={() => setTransactionMode('zero')}>Deplete Entirely</button>
        </div>



        <div className="col-span-1 sm:col-span-2 w-full">
          <UnmanagedForm.Number placeholder="0" input={input} onChangeOutput={setInput} />
        </div>

        <div className=" col-span-1 sm:col-span-2 flex justify-end gap-x-4 items-center">

          <button className="btn btn-warning btn-outline" onClick={() => handleCancel()}>Cancel</button>

          <button className="btn btn-success" onClick={() => handleSubmit()}>Submit</button>
        </div>


      </div>



    </Dialog.Root>
  )
}

export default TransactionDialog
