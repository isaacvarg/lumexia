'use client'
import { AnimatePresence, motion } from "framer-motion"
import { useTabSelection } from "@/store/tabSlice"
import type { CanonDashboard } from "@/lib/canon/dashboard"
import StatCards from "./StatCards"
import TabSelector from "./shared/TabSelector"
import Attention from "./Attention"
import ChangeRequests from "./ChangeRequests"
import Coverage from "./Coverage"
import Activity from "./Activity"

const Dashboard = ({ data }: { data: CanonDashboard }) => {
  const { activeTab } = useTabSelection()
  const currentTab = activeTab.canonDashboard

  return (
    <div className="flex flex-col gap-y-6">
      <StatCards summary={data.summary} />
      <TabSelector counts={{ attention: data.attention.length, requests: data.changeRequests.length }} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentTab === 'attention' && <Attention attention={data.attention} />}
          {currentTab === 'requests' && <ChangeRequests changeRequests={data.changeRequests} />}
          {currentTab === 'coverage' && <Coverage types={data.types} />}
          {currentTab === 'activity' && <Activity events={data.events} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
