"use client"

import { useMbprDetailsSelection } from "@/store/mbprDetailsSlice";
import { AnimatePresence, motion } from "framer-motion";
import OverviewTab from "../tabs/OverviewTab";
import InstructionsTab from "../tabs/InstructionsTab";
import NotesTab from "../tabs/NotesTab";
import ActivityTab from "../tabs/ActivityTab";
import RndTab from "../tabs/RndTab";

const TabsContainer = () => {

  const { currentTab } = useMbprDetailsSelection();

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
      {currentTab === 'overview' && <OverviewTab />}
      {currentTab === 'instructions' && <InstructionsTab />}
      {currentTab === 'notes' && <NotesTab />}
      {currentTab === 'activity' && <ActivityTab />}
      {currentTab === 'rnd' && <RndTab />}
    </AnimatePresence>
  )
}

export default TabsContainer
