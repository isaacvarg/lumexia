"use client"
import { useItemSelection } from "@/store/itemSlice"
import Basics from "../basics/Basics"
import Purchasing from "../purchasing/Purchasing";
import { motion, AnimatePresence } from 'framer-motion';
import Inventory from "../inventory/Inventory";
import Pricing from "../pricing/Pricing";
import Production from "../production/Production";
import Rnd from "../rnd/Rnd";
import Files from "../files/Files";
import Quality from "../quality/Quality";
import { useTabSelection } from "@/store/tabSlice";
import Danger from "../danger/Danger";


const TabsContainer = () => {

  const { activeTab } = useTabSelection();

  const currentTab = activeTab['itemDetails'];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {currentTab === 'basics' && <Basics />}
        {currentTab === 'inventory' && <Inventory />}
        {currentTab === 'purchasing' && <Purchasing />}
        {currentTab === 'pricing' && <Pricing />}
        {currentTab === 'production' && <Production />}
        {currentTab === 'rnd' && <Rnd />}
        {currentTab === 'quality' && <Quality />}
        {currentTab === 'files' && <Files />}
        {currentTab === 'danger' && <Danger />}
      </motion.div>
    </AnimatePresence>
  )
}

export default TabsContainer
