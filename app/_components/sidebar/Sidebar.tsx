'use client'
import React from "react";
import { useAuditRequest } from "@/hooks/appQuery/useAuditRequest";
import { useAllPurchasingRequests } from "@/hooks/appQuery/useAllPurchasingRequests";
import { sidebarElements } from "./sidebar.config";
import SidebarGroupTitle from "./SidebarGroupTitle";
import SidebarButton from "./SidebarButton";
import SidebarHeader from "./SidebarHeader";
import { useAppSelection } from "@/store/appSlice";
import { motion } from "framer-motion";

const Sidebar = () => {

  const { data: auditRequests } = useAuditRequest();
  const { data: purchasingRequests } = useAllPurchasingRequests();
  const { isSidebarCollapsed } = useAppSelection()

  const sidebarVariants = {
    expanded: {
      width: "18rem",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    collapsed: {
      width: "5rem",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isSidebarCollapsed ? "collapsed" : "expanded"}
      className="pt-2 pb-8 shadow-xl bg-base-100 shadow-base-300 z-40 min-h-dvh"
    >

      <SidebarHeader isSidebarCollapsed={isSidebarCollapsed} />

      <div className="flex flex-col gap-y-8 px-4">

        {sidebarElements.map((group) => {

          return (
            <div key={group.label} className="flex flex-col gap-y-3">
              <SidebarGroupTitle isSidebarCollapsed={isSidebarCollapsed}>{group.label}</SidebarGroupTitle>
              <div className="flex flex-col gap-y-2">
                {group.contents.map((sidebarItem) => {

                  let badgeData: number | string | undefined;

                  switch (sidebarItem.label) {
                    case 'Audit':
                      badgeData = auditRequests
                      break;
                    case 'Requests':
                      badgeData = purchasingRequests
                      break;
                    default:
                      break;
                  }
                  return (
                    <SidebarButton key={sidebarItem.label} {...sidebarItem} badge={badgeData} isSidebarCollapsed={isSidebarCollapsed} />
                  )
                })}
              </div>

            </div>


          )
        })}
      </div>

    </motion.div>

  );
};

export default Sidebar;
