import { GuideSection } from "../../types";
import Overview from "./Overview";
import AggregatedFiles from "./AggregatedFiles";

export const experimentFilesSection: GuideSection = {
  id: "experiment-files",
  title: "Experiment — Files",
  overview: Overview,
  guides: [
    {
      title: "Aggregated files",
      description: "Experiment and sample files rolled into one list.",
      content: AggregatedFiles,
    },
  ],
};
