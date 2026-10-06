'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import React from "react"

type Props = {
  dataTypes: React.ReactNode
  groups: React.ReactNode
  teams: React.ReactNode
}

const TabsContainer = ({ dataTypes, groups, teams }: Props) => {

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
        {currentTab === 'groups' && groups}
        {currentTab === 'teams' && teams}
      </motion.div>
    </AnimatePresence>
  )
}

export default TabsContainer
