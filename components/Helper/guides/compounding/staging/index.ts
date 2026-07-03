import { GuideSection } from "../../types";
import Overview from "./Overview";
import StagingAMaterial from "./StagingAMaterial";

export const compoundingStagingSection: GuideSection = {
  id: "compounding-staging",
  title: "Staging a material",
  overview: Overview,
  guides: [
    {
      title: "Staging a material",
      description: "Scan the lot, weigh within ±1.5%, and optionally photograph it.",
      content: StagingAMaterial,
    },
  ],
};
