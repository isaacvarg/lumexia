import { GuideSection } from "../../types";
import Overview from "./Overview";
import VerifyingMaterials from "./VerifyingMaterials";
import VerifyingSteps from "./VerifyingSteps";

export const productionQualityVerifySection: GuideSection = {
  id: "production-quality-verify",
  title: "Verifying a batch",
  overview: Overview,
  guides: [
    {
      title: "Verifying materials",
      description: "Reviewing staged pulls and quantities, then verify or deny.",
      content: VerifyingMaterials,
    },
    {
      title: "Verifying flagged steps",
      description: "Two-pass approval of verification-required step actionables.",
      content: VerifyingSteps,
    },
  ],
};
