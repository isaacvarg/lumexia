import { GuideSection } from "../types";
import Overview from "./Overview";
import WhatLumexiaDoes from "./WhatLumexiaDoes";
import ThisDashboard from "./ThisDashboard";

// The front door: wired explicitly on `/` and doubles as the helperSlice
// default/fallback (see store/helperSlice.ts DEFAULT_SECTION_ID) shown whenever no
// other section applies.
export const homeSection: GuideSection = {
  id: "home",
  title: "Welcome to Lumexia",
  overview: Overview,
  guides: [
    {
      title: "What Lumexia does",
      description: "The module chain, from purchase order to priced product.",
      content: WhatLumexiaDoes,
    },
    {
      title: "This dashboard",
      description: "Configurable panels, not a fixed layout.",
      content: ThisDashboard,
    },
  ],
};
