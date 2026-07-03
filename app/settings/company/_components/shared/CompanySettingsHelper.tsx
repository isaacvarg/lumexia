"use client";

import { useEffect } from "react";
import { useHelperActions } from "@/store/helperSlice";
import { useTabSelection } from "@/store/tabSlice";

// Drives the Helper bar from the active Company Settings tab. Each tab maps to its
// own guide section (`settings-company-<tab>`); the bar is set on tab change and
// cleared on unmount so leaving the page resets it to the default.
const CompanySettingsHelper = () => {
  const { setHelper, clearHelper } = useHelperActions();
  const activeTab = useTabSelection((state) => state.activeTab.companySettings);

  useEffect(() => {
    if (!activeTab) return;
    setHelper(`settings-company-${activeTab}`);
  }, [activeTab, setHelper]);

  useEffect(() => {
    return () => clearHelper();
  }, [clearHelper]);

  return null;
};

export default CompanySettingsHelper;
