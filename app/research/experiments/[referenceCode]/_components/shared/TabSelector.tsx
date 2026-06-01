"use client";
import TabButton from "./TabButton";

export type ExperimentTab =
  | "basics"
  | "variants"
  | "samples"
  | "cost"
  | "notes"
  | "files";

const TABS: ExperimentTab[] = [
  "basics",
  "variants",
  "samples",
  "cost",
  "notes",
  "files",
];

const TabSelector = () => {
  return (
    <div className="flex items-center justify-start gap-x-6">
      {TABS.map((tab) => (
        <TabButton key={tab} tab={tab} />
      ))}
    </div>
  );
};

export default TabSelector;
