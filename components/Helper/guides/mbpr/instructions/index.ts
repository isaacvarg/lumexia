import { GuideSection } from "../../types";
import Overview from "./Overview";
import WorkInstructions from "./WorkInstructions";

export const mbprInstructionsSection: GuideSection = {
  id: "mbpr-instructions",
  title: "MBPR — Instructions",
  overview: Overview,
  guides: [
    {
      title: "Work instructions",
      description: "Per-step directions, shown here and during compounding.",
      content: WorkInstructions,
    },
  ],
};
