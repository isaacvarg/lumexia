'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import React from "react"

type Props = {
  dataTypes: React.ReactNode
  teams: React.ReactNode
}

const TabsContainer = ({ dataTypes, teams }: Props) => {

  const { activeTab } = useTabSelection()
  const currentTab = activeTab.canonSettings;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {currentTab === 'dataTypes' && dataTypes}
        {currentTab === 'teams' && teams}
      </motion.div>
    </AnimatePresence>
  )
}

export default TabsContainer
