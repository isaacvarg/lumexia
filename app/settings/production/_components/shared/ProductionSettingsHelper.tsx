"use client";

import { useEffect } from "react";
import { useHelperActions } from "@/store/helperSlice";
import { useTabSelection } from "@/store/tabSlice";

// Drives the Helper bar from the active Production Settings tab. Each tab maps to
// its own guide section (`settings-production-<tab>`); the bar is set on tab change
// and cleared on unmount so leaving the page resets it to the default.
const ProductionSettingsHelper = () => {
  const { setHelper, clearHelper } = useHelperActions();
  const activeTab = useTabSelection((state) => state.activeTab.productionSettings);

  useEffect(() => {
    if (!activeTab) return;
    setHelper(`settings-production-${activeTab}`);
  }, [activeTab, setHelper]);

  useEffect(() => {
    return () => clearHelper();
  }, [clearHelper]);

  return null;
};

export default ProductionSettingsHelper;
