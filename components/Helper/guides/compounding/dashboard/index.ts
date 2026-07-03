import { GuideSection } from "../../types";
import Overview from "./Overview";
import StagingAndCompounding from "./StagingAndCompounding";

export const compoundingDashboardSection: GuideSection = {
  id: "compounding",
  title: "Compounding",
  overview: Overview,
  guides: [
    {
      title: "Staging & compounding",
      description: "The two phases, the three roles, and the schedule requirement.",
      content: StagingAndCompounding,
    },
  ],
};
