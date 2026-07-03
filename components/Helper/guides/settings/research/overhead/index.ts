import { GuideSection } from "../../../types";
import Overview from "./Overview";
import SingletonConfig from "./SingletonConfig";

export const settingsResearchOverheadSection: GuideSection = {
  id: "settings-research-overhead",
  title: "Cost Overhead",
  overview: Overview,
  guides: [
    {
      title: "One global setting",
      description: "Why this form always edits the same singleton record.",
      content: SingletonConfig,
    },
  ],
};
