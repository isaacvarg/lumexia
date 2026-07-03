import { GuideSection } from "../../../types";
import Overview from "./Overview";
import OrderingAndReuse from "./OrderingAndReuse";

export const settingsResearchBatchSizesSection: GuideSection = {
  id: "settings-research-batchSizes",
  title: "Cost Batch Sizes",
  overview: Overview,
  guides: [
    {
      title: "Ordering & reuse",
      description: "Global presets, not scoped per experiment or product.",
      content: OrderingAndReuse,
    },
  ],
};
