'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import React from "react"

type Props = {
  profile: React.ReactNode
  status: React.ReactNode
  dashboard: React.ReactNode
  danger: React.ReactNode
}

const TabsContainer = ({ profile, status, dashboard, danger }: Props) => {

  const { activeTab } = useTabSelection()
  const currentTab = activeTab.userAdminDetails;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {currentTab === 'profile' && profile}
        {currentTab === 'status' && status}
        {currentTab === 'dashboard' && dashboard}
        {currentTab === 'danger' && danger}
      </motion.div>
    </AnimatePresence>
  )
}

export default TabsContainer
