import { GuideSection } from "../../types";
import Overview from "./Overview";
import VerificationWorkflow from "./VerificationWorkflow";

export const productionQualityDashboardSection: GuideSection = {
  id: "production-quality",
  title: "Production Quality",
  overview: Overview,
  guides: [
    {
      title: "Verification workflow",
      description: "The two-pass, two-role model and the three gates it enforces.",
      content: VerificationWorkflow,
    },
  ],
};
