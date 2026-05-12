"use client"

import { useBprDetailsSelection } from "@/store/bprDetailsSlice";
import { AnimatePresence, motion } from "framer-motion";
import BomTab from "../bom/BomTab";
import ActivityTab from "../activity/ActivityTab";
import NotesTab from "../notes/NotesTab";
import BasicsTab from "../basics/BasicsTab";
import QualityTab from "../quality/QualityTab";
import StepsTab from "../steps/StepsTab";


const TabsContainer = () => {

  const { currentTab } = useBprDetailsSelection();

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
      {currentTab === 'basics' && <BomTab />}
      {currentTab === 'steps' && <StepsTab />}
      {currentTab === 'quality' && <QualityTab />}
      {currentTab === 'notes' && <NotesTab />}
      {currentTab === 'activity' && <ActivityTab />}
    </AnimatePresence>
  )
}

export default TabsContainer
