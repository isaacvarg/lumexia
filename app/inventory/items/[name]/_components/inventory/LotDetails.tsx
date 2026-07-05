import { useItemActions, useItemSelection } from "@/store/itemSlice"
import { TbArrowLeft, TbFileDescription, TbPlusMinus, TbQrcode } from "react-icons/tb"
import { printLotLabel } from "../../_actions/inventory/printLotLabel"
import { Lot } from "@/types/lot"
import useDialog from "@/hooks/useDialog"
import TransactionDialog from "./TransactionDialog"
import Card from "@/components/Card"
import { useEffect, useState } from "react"
import TransactionsTable from "./TransactionsTable"
import LotBasics from "./LotBasics"
import LotNotes from "./LotNotes"
import Alert from "@/components/Alert"
import { qcExaminationTypes } from "@/configs/staticRecords/qcExaminationTypes"
import { generateCoa } from "../../_actions/coa/generateCoa"
import { useRouter } from "next/navigation"

const LotDetails = () => {

  const { setLotsViewMode, setSelectedLot, getSelectedLotTransactions, getSelectedLotNotes } = useItemActions()
  const { selectedLot, selectedLotTransactions, qcRecords, item } = useItemSelection()
  const { showDialog } = useDialog()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleBack = () => {
    setLotsViewMode('table')
    setSelectedLot(null);
  }

  const printLabel = async () => {
    await printLotLabel(selectedLot as any)
  }

  const handleGenerateCoa = async () => {
    if (!selectedLot || !item) return;

    const finishedProductRecords = qcRecords.filter(
      (r) =>
        r.examinedLot?.id === selectedLot.id &&
        r.examinationType.id === qcExaminationTypes.finishedProduct
    );

    if (finishedProductRecords.length === 0) {
      showDialog("coaMissingExamDialog");
      return;
    }

    const record = finishedProductRecords.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    setIsGenerating(true);
    try {
      await generateCoa(item, selectedLot.lotNumber, record);
      router.refresh();
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    getSelectedLotTransactions();
    getSelectedLotNotes();
  }, [selectedLot, getSelectedLotNotes, getSelectedLotTransactions])


  return (
    <div className="col-span-1 sm:col-span-2 lg:col-span-3">
      <TransactionDialog />

      <Alert.Root identifier="coaMissingExamDialog">
        <Alert.Content
          title="No Finished Product Examination"
          action={() => {}}
          actionLabel="OK"
          actionColor="neutral"
        >
          This lot does not have a Finished Product examination record. Please conduct a Finished Product examination before generating a Certificate of Analysis.
        </Alert.Content>
      </Alert.Root>

      <div className="flex flex-col gap-y-6">
        <div className="flex flex-row justify-between items-center">
          <button className="btn btn-secondary flex gap-x-2" onClick={() => handleBack()} >
            <TbArrowLeft className="text-2xl" />
            <p>Back</p>
          </button>

          <div className="flex gap-x-2">
            <button className="btn btn-accent flex gap-x-2" onClick={() => printLabel()} >
              <TbQrcode className="text-2xl" />
              <p>Print Label</p>
            </button>
            <button className="btn btn-accent flex gap-x-2" disabled={isGenerating}
              onClick={handleGenerateCoa}
            >
              <TbFileDescription className="text-2xl" />
              <p>{isGenerating ? "Generating..." : "Generate COA"}</p>
            </button>
            <button className="btn btn-accent flex gap-x-2"
              onClick={() => showDialog("transactionDialog")}
            >
              <TbPlusMinus className="text-2xl" />
              <p>Create Transation</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <LotBasics />
          <LotNotes />


          <TransactionsTable />

        </div>

      </div>


    </div>
  )
}

export default LotDetails
