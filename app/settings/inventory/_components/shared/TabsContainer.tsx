'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import React from "react"

type Props = {
  triggers: React.ReactNode
  configuration: React.ReactNode
}

const TabsContainer = ({ triggers, configuration }: Props) => {

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
      </motion.div>
    </AnimatePresence>
  )
}

export default TabsContainer
