import { GuideSection } from "../../types";
import Overview from "./Overview";
import Notes from "./Notes";

export const bprNotesSection: GuideSection = {
  id: "bpr-notes",
  title: "Batch — Notes",
  overview: Overview,
  guides: [
    {
      title: "Notes",
      description: "Typed notes scoped to this batch.",
      content: Notes,
    },
  ],
};
