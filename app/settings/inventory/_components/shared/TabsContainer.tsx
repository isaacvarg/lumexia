'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import React from "react"

type Props = {
  triggers: React.ReactNode
  configuration: React.ReactNode
  documents: React.ReactNode
  units: React.ReactNode
}

const TabsContainer = ({ triggers, configuration, documents, units }: Props) => {

  const { activeTab } = useTabSelection()
  const currentTab = activeTab.inventorySettings;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {currentTab === 'triggers' && triggers}
        {currentTab === 'configuration' && configuration}
        {currentTab === 'documents' && documents}
        {currentTab === 'units' && units}
      </motion.div>
    </AnimatePresence>
  )
}

export default TabsContainer
