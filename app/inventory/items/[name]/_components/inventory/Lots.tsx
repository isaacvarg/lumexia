import { useItemSelection } from "@/store/itemSlice"
import { AnimatePresence, motion } from "framer-motion"
import LotsTable from "./LotsTable"
import LotDetails from "./LotDetails"
import SectionTitle from "@/components/Text/SectionTitle"
import { TbPlus } from "react-icons/tb"
import useDialog from "@/hooks/useDialog"
import CreateLotDialog from "./CreateLotDialog"

export type LotsViewMode = 'table' | 'lot';

const Lots = () => {

  const { lotsViewMode, selectedLot } = useItemSelection()
  const { showDialog } = useDialog()
  const title = lotsViewMode === 'table' ? 'Lots' : `Lot ${selectedLot?.lotNumber}`;

  const handleCreateLot = () => {
    showDialog('createLot')
  }

  return (
    <>
      <CreateLotDialog />

      <div className="col-span-1 sm:col-span-2 lg:col-span-3">

        <div className="flex flex-col gap-y-6">
          <div className="flex flex-row items-center justify-between">
            <SectionTitle>{title}</SectionTitle>
            {lotsViewMode === 'table' && (
              <button
                onClick={handleCreateLot}
                className="btn btn-secondary"
              >
                <TbPlus className="size-4" />
              </button>
            )}
          </div>


        <AnimatePresence mode="wait">
          <motion.div
            key={lotsViewMode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {lotsViewMode === 'table' && <LotsTable />}
            {lotsViewMode === 'lot' && <LotDetails />}
          </motion.div>
        </AnimatePresence>
      </div>


      </div>
    </>
  )
}

export default Lots
