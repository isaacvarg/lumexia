import { GuideSection } from "../../types";
import Overview from "./Overview";
import Activity from "./Activity";

export const mbprActivitySection: GuideSection = {
  id: "mbpr-activity",
  title: "MBPR — Activity",
  overview: Overview,
  guides: [
    {
      title: "Activity",
      description: "The MBPR's change history.",
      content: Activity,
    },
  ],
};
