"use client";
import { useTabActions, useTabSelection } from "@/store/tabSlice";
import { ExperimentTab } from "./TabSelector";

const TabButton = ({ tab }: { tab: ExperimentTab }) => {
  const { setActiveTab } = useTabActions();
  const { activeTab } = useTabSelection();

  const isSelected = activeTab["experimentDetails"] === tab;

  return (
    <button
      className={`capitalize min-w-40 btn btn-secondary ${isSelected ? "" : "btn-dash"}`}
      onClick={() => setActiveTab("experimentDetails", tab)}
    >
      {tab}
    </button>
  );
};

export default TabButton;
