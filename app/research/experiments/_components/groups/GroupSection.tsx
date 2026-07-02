"use client";

import { useState } from "react";
import SectionTitle from "@/components/Text/SectionTitle";
import { TbChevronDown, TbChevronRight } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { ExperimentGroupWithExperiments } from "@/actions/research/getExperimentGroupsWithExperiments";
import ExperimentCard from "../shared/ExperimentCard";

const GroupSection = ({ group }: { group: ExperimentGroupWithExperiments }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          className="btn btn-ghost"
        >
          {isCollapsed ? (
            <TbChevronRight className="size-6" />
          ) : (
            <TbChevronDown className="size-6" />
          )}
        </button>
        <SectionTitle>{group.label}</SectionTitle>
        <span
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: group.status.bgColor,
            color: group.status.textColor,
          }}
        >
          {group.status.name}
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-info text-xs font-semibold text-info-content">
          {group.experiments.length}
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-3 gap-6"
          >
            {group.experiments.map((experiment) => (
              <ExperimentCard key={experiment.id} experiment={experiment} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupSection;
