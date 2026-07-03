import { GuideSection } from "../../types";
import Overview from "./Overview";
import WorkingABatch from "./WorkingABatch";

export const compoundingBatchSection: GuideSection = {
  id: "compounding-batch",
  title: "Compounding a batch",
  overview: Overview,
  guides: [
    {
      title: "Working a batch",
      description: "From Begin Staging through completing the last step.",
      content: WorkingABatch,
    },
  ],
};
