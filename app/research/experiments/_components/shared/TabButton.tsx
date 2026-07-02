"use client";

import { ExperimentsListTab } from "./TabSelector";
import { useTabActions, useTabSelection } from "@/store/tabSlice";

const TabButton = ({
  tab,
  label,
}: {
  tab: ExperimentsListTab;
  label: string;
}) => {
  const { setActiveTab } = useTabActions();
  const { activeTab } = useTabSelection();
  const isSelected = activeTab.researchExperiments === tab;

  return (
    <button
      className={`min-w-40 btn btn-secondary ${isSelected ? "" : "btn-dash"}`}
      onClick={() => setActiveTab("researchExperiments", tab)}
    >
      {label}
    </button>
  );
};

export default TabButton;
