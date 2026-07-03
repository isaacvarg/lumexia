import { GuideSection } from "../../types";
import Overview from "./Overview";
import CreatingAnExperiment from "./CreatingAnExperiment";
import Statuses from "./Statuses";

export const researchExperimentsSection: GuideSection = {
  id: "research-experiments",
  title: "Experiments",
  overview: Overview,
  guides: [
    {
      title: "Creating an experiment",
      description: "Subject, objective, hypothesis, and group.",
      content: CreatingAnExperiment,
    },
    {
      title: "Experiment statuses",
      description: "Planning through Cancelled — descriptive, not a gate.",
      content: Statuses,
    },
  ],
};
