'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import React from "react"
import { UserAdminTab } from "./TabSelector"

type Props = Partial<Record<UserAdminTab, React.ReactNode>> & { profile: React.ReactNode }

const TabsContainer = (panels: Props) => {

  const { activeTab } = useTabSelection()
  // Until TabSelector resets a tab this user doesn't have, show the profile.
  const selected = activeTab.userAdminDetails
  const currentTab: UserAdminTab = selected && panels[selected] ? selected : 'profile'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {panels[currentTab]}
      </motion.div>
    </AnimatePresence>
  )
}

export default TabsContainer
