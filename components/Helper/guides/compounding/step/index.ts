import { GuideSection } from "../../types";
import Overview from "./Overview";
import WorkingAStep from "./WorkingAStep";

export const compoundingStepSection: GuideSection = {
  id: "compounding-step",
  title: "Working a step",
  overview: Overview,
  guides: [
    {
      title: "Working a step",
      description: "Checking off materials, completing actionables, and locked steps.",
      content: WorkingAStep,
    },
  ],
};
