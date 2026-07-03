import { GuideSection } from "../../types";
import Overview from "./Overview";
import Activity from "./Activity";

export const bprActivitySection: GuideSection = {
  id: "bpr-activity",
  title: "Batch — Activity",
  overview: Overview,
  guides: [
    {
      title: "Activity",
      description: "The batch's change history.",
      content: Activity,
    },
  ],
};
