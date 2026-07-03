"use client";

import { useEffect } from "react";
import { useHelperActions } from "@/store/helperSlice";
import { useQcParameterSelection } from "@/store/qcParametersSlice";

// Drives the Helper bar from the active parameters-manager tab. The tabs live in
// qcParametersSlice (not the global tab store), so this subscribes to `currentTab`
// and maps each to its own guide section (`qc-param-<tab>`), clearing on unmount.
const QcParametersHelper = () => {
  const { setHelper, clearHelper } = useHelperActions();
  const currentTab = useQcParameterSelection((state) => state.currentTab);

  useEffect(() => {
    if (!currentTab) return;
    setHelper(`qc-param-${currentTab}`);
  }, [currentTab, setHelper]);

  useEffect(() => {
    return () => clearHelper();
  }, [clearHelper]);

  return null;
};

export default QcParametersHelper;
