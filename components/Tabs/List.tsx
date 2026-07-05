import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import TabsPanel from ".";
import { PanelStates } from "@/store/panelSelectionSlice";
import { Tab } from "./Trigger";

type TabsListProps = {
  tabTriggers: Tab[];
  panelStateName: PanelStates
};

const TabList = ({ tabTriggers, panelStateName }: TabsListProps) => {
  return (
    <Tabs.List
      className="shrink-0 flex overflow-x-auto border-b border-accent"

    >
      {tabTriggers.map((tab) => (
        <TabsPanel.Trigger
          key={tab.identifier}
          panelStateName={panelStateName}
          identifier={tab.identifier}
          label={tab.label}
          tab={tab}
        />
      ))}
    </Tabs.List>
  );
};

export default TabList;
