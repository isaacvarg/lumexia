"use client";

import TabButton from "./TabButton";

export type ExperimentsListTab = "experiments" | "groups";

const labels: Record<ExperimentsListTab, string> = {
  experiments: "Experiments",
  groups: "Experiment Groups",
};

const TabSelector = () => {
  const tabs: ExperimentsListTab[] = ["experiments", "groups"];

  return (
    <div className="flex items-center justify-start gap-6 py-4">
      {tabs.map((tab) => (
        <TabButton key={tab} tab={tab} label={labels[tab]} />
      ))}
    </div>
  );
};

export default TabSelector;
