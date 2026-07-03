import { GuideSection } from "../../types";
import Overview from "./Overview";
import Groups from "./Groups";

export const researchGroupsSection: GuideSection = {
  id: "research-groups",
  title: "Experiment groups",
  overview: Overview,
  guides: [
    {
      title: "Experiment groups",
      description: "Grouping related experiments, each with its own status.",
      content: Groups,
    },
  ],
};
