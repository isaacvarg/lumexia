import { GuideSection } from "../../types";
import Overview from "./Overview";
import ActivityLog from "./ActivityLog";

export const purchaseOrderActivitySection: GuideSection = {
  id: "po-activity",
  title: "Purchase order — Activity",
  overview: Overview,
  guides: [
    {
      title: "Activity log",
      description: "The change history, filterable by action and by user.",
      content: ActivityLog,
    },
  ],
};
