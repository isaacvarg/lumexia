"use client";

import { useEffect } from "react";
import { useHelperActions } from "@/store/helperSlice";
import { useMbprDetailsSelection } from "@/store/mbprDetailsSlice";

// Drives the Helper bar from the active MBPR detail tab. The detail tabs live in
// mbprDetailsSlice (not the global tab store), so this subscribes to `currentTab`
// and maps each to its own guide section (`mbpr-<tab>`), clearing on unmount.
const MbprHelper = () => {
  const { setHelper, clearHelper } = useHelperActions();
  const currentTab = useMbprDetailsSelection((state) => state.currentTab);

  useEffect(() => {
    if (!currentTab) return;
    setHelper(`mbpr-${currentTab}`);
  }, [currentTab, setHelper]);

  useEffect(() => {
    return () => clearHelper();
  }, [clearHelper]);

  return null;
};

export default MbprHelper;
