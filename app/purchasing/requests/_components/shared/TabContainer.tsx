'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import NewTab from "../new/NewTab"
import StatusTab from "../status/StatusTab"
import SupplierTab from "../supplier/SupplierTab"
import CalendarTab from "../calendar/CalendarTab"

const TabsContainer = () => {

  const { activeTab } = useTabSelection()
  const currentTab = activeTab.requests;

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

      {currentTab === 'new' && <NewTab />}
      {currentTab === 'status' && <StatusTab />}
      {currentTab === 'supplier' && <SupplierTab />}
      {currentTab === 'calendar' && <CalendarTab />}

    </AnimatePresence>
  )
}

export default TabsContainer
