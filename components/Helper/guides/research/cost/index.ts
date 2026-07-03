import { GuideSection } from "../../types";
import Overview from "./Overview";
import CostProjections from "./CostProjections";

export const experimentCostSection: GuideSection = {
  id: "experiment-cost",
  title: "Experiment — Cost",
  overview: Overview,
  guides: [
    {
      title: "Cost projections",
      description: "Material cost + overhead, per batch size, and the production delta.",
      content: CostProjections,
    },
  ],
};
