"use client";

import { useEffect } from "react";
import { useHelperActions } from "@/store/helperSlice";
import { useTabSelection } from "@/store/tabSlice";

// Drives the Helper bar from the active Inventory Settings tab. Each tab maps to
// its own guide section (`settings-inventory-<tab>`); the bar is set on tab change
// and cleared on unmount so leaving the page resets it to the default.
const InventorySettingsHelper = () => {
  const { setHelper, clearHelper } = useHelperActions();
  const activeTab = useTabSelection((state) => state.activeTab.inventorySettings);

  useEffect(() => {
    if (!activeTab) return;
    setHelper(`settings-inventory-${activeTab}`);
  }, [activeTab, setHelper]);

  useEffect(() => {
    return () => clearHelper();
  }, [clearHelper]);

  return null;
};

export default InventorySettingsHelper;
