import { GuideSection } from "../../types";
import Overview from "./Overview";
import Steps from "./Steps";

export const bprStepsSection: GuideSection = {
  id: "bpr-steps",
  title: "Batch — Steps",
  overview: Overview,
  guides: [
    {
      title: "Batch steps",
      description: "The per-run steps and their completion values.",
      content: Steps,
    },
  ],
};
