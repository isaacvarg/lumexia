'use client'
import { useBprPlanningSelection } from "@/store/bprPlanningSlice"
import { AnimatePresence, motion } from "framer-motion"
import StatusTab from "../status/StatusTab"
import TableTab from "../table/TableTab"

const TabsContainer = () => {

  const { currentTab } = useBprPlanningSelection()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
      </motion.div>

      {currentTab === 'status' && <StatusTab />}
      {currentTab === 'table' && <TableTab />}

    </AnimatePresence>
  )
}

export default TabsContainer
