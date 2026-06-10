'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import React from "react"

type Props = {
  info: React.ReactNode
  images: React.ReactNode
}

const TabsContainer = ({ info, images }: Props) => {

  const { activeTab } = useTabSelection()
  const currentTab = activeTab.companySettings;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {currentTab === 'info' && info}
        {currentTab === 'images' && images}
      </motion.div>
    </AnimatePresence>
  )
}

export default TabsContainer
