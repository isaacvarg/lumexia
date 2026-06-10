'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import React from "react"

const TabsContainer = ({ main, dashboard }: { main: React.ReactNode, dashboard: React.ReactNode }) => {

  const { activeTab } = useTabSelection()
  const currentTab = activeTab.userSettings;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {currentTab === 'main' && main}
        {currentTab === 'dashboard' && dashboard}
      </motion.div>
    </AnimatePresence>
  )
}

export default TabsContainer
