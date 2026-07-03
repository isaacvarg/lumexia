import { GuideSection } from "../../types";
import Overview from "./Overview";
import RequestingABatch from "./RequestingABatch";
import BatchLifecycle from "./BatchLifecycle";
import HandlingCompleted from "./HandlingCompleted";

export const planningDashboardSection: GuideSection = {
  id: "planning",
  title: "Planning",
  overview: Overview,
  guides: [
    {
      title: "Requesting a batch",
      description: "The wizard that turns an MBPR into a Draft BPR.",
      content: RequestingABatch,
    },
    {
      title: "Batch lifecycle",
      description: "The statuses a batch moves through, from Draft to Released.",
      content: BatchLifecycle,
    },
    {
      title: "Handling completed batches",
      description: "Consuming materials and advancing to Awaiting QC.",
      content: HandlingCompleted,
    },
  ],
};
