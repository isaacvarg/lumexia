import { GuideSection } from "../../types";
import Overview from "./Overview";
import WhatIsAnMbpr from "./WhatIsAnMbpr";

export const mbprListSection: GuideSection = {
  id: "mbpr",
  title: "Master Batch Records",
  overview: Overview,
  guides: [
    {
      title: "What is an MBPR",
      description: "The master recipe, and how it relates to a BPR and production.",
      content: WhatIsAnMbpr,
    },
  ],
};
