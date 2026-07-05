import { useState } from "react";
import { RequestForDashboard } from "../../_functions/getRequests";
import SectionTitle from "@/components/Text/SectionTitle";
import { TbChevronDown, TbChevronRight } from "react-icons/tb";
import RequestCard from "../shared/RequestCard";
import { motion, AnimatePresence } from "framer-motion";

const StatusGroup = ({ requests, statusName }: { requests: RequestForDashboard[], statusName: string }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex gap-4">
        {isCollapsed ? <button onClick={() => setIsCollapsed(false)} className="btn btn-ghost"><TbChevronRight className="size-6" /></button> : <button onClick={() => setIsCollapsed(true)} className="btn btn-ghost"><TbChevronDown className="size-6" /> </button>}
        <SectionTitle>{statusName}</SectionTitle>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {requests.map((r: RequestForDashboard) => <RequestCard key={r.id} request={r} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StatusGroup;
