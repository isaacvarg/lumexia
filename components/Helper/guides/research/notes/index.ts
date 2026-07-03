import { GuideSection } from "../../types";
import Overview from "./Overview";
import AggregatedNotes from "./AggregatedNotes";

export const experimentNotesSection: GuideSection = {
  id: "experiment-notes",
  title: "Experiment — Notes",
  overview: Overview,
  guides: [
    {
      title: "Aggregated notes",
      description: "Experiment and sample notes rolled into one feed.",
      content: AggregatedNotes,
    },
  ],
};
