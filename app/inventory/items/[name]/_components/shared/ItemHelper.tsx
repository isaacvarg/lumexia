"use client";

import { useEffect } from "react";
import { useHelperActions } from "@/store/helperSlice";
import { useTabSelection } from "@/store/tabSlice";

// Drives the Helper bar from the active item-details tab. Each tab maps to its
// own guide section (`item-<tab>`); the bar is set on tab change and cleared on
// unmount so leaving the page resets it to the default.
const ItemHelper = () => {
  const { setHelper, clearHelper } = useHelperActions();
  const activeTab = useTabSelection((state) => state.activeTab.itemDetails);

  useEffect(() => {
    if (!activeTab) return;
    setHelper(`item-${activeTab}`);
  }, [activeTab, setHelper]);

  useEffect(() => {
    return () => clearHelper();
  }, [clearHelper]);

  return null;
};

export default ItemHelper;
