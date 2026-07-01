'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import React from "react"

type Props = {
  equipment: React.ReactNode
  vessels: React.ReactNode
  actionables: React.ReactNode
}

const TabsContainer = ({ equipment, vessels, actionables }: Props) => {

  const { activeTab } = useTabSelection()
  const currentTab = activeTab.productionSettings;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {currentTab === 'equipment' && equipment}
        {currentTab === 'vessels' && vessels}
        {currentTab === 'actionables' && actionables}
      </motion.div>
    </AnimatePresence>
  )
}

export default TabsContainer
