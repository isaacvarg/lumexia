"use client";

import { useEffect } from "react";
import { useHelperActions } from "@/store/helperSlice";
import { useBprDetailsSelection } from "@/store/bprDetailsSlice";

// Drives the Helper bar from the active BPR detail tab. The detail tabs live in
// bprDetailsSlice (not the global tab store), so this subscribes to `currentTab`
// and maps each to its own guide section (`bpr-<tab>`), clearing on unmount.
const BprHelper = () => {
  const { setHelper, clearHelper } = useHelperActions();
  const currentTab = useBprDetailsSelection((state) => state.currentTab);

  useEffect(() => {
    if (!currentTab) return;
    setHelper(`bpr-${currentTab}`);
  }, [currentTab, setHelper]);

  useEffect(() => {
    return () => clearHelper();
  }, [clearHelper]);

  return null;
};

export default BprHelper;
