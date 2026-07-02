'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import React from "react"

type Props = {
  overhead: React.ReactNode
  batchSizes: React.ReactNode
}

const TabsContainer = ({ overhead, batchSizes }: Props) => {

  const { activeTab } = useTabSelection()
  const currentTab = activeTab.researchSettings;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {currentTab === 'overhead' && overhead}
        {currentTab === 'batchSizes' && batchSizes}
      </motion.div>
    </AnimatePresence>
  )
}

export default TabsContainer
