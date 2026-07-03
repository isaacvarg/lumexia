import { GuideSection } from "../../types";
import Overview from "./Overview";
import OverviewPanels from "./OverviewPanels";

export const mbprOverviewSection: GuideSection = {
  id: "mbpr-overview",
  title: "MBPR — Overview",
  overview: Overview,
  guides: [
    {
      title: "Overview panels",
      description: "Basics, Batch Sizes, and the Bill of Materials.",
      content: OverviewPanels,
    },
  ],
};
