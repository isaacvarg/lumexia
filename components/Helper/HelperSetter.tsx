"use client";

import { useEffect } from "react";
import { useHelperActions } from "@/store/helperSlice";

// Declarative setter: sets the helper bar content for the given section on mount
// and clears it on unmount, so leaving the page resets the bar to its default.
const HelperSetter = ({ section }: { section: string }) => {
  const { setHelper, clearHelper } = useHelperActions();

  useEffect(() => {
    setHelper(section);
    return () => clearHelper();
  }, [section, setHelper, clearHelper]);

  return null;
};

export default HelperSetter;
