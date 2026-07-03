import { GuideSection } from "../../types";
import Overview from "./Overview";
import Notes from "./Notes";

export const mbprNotesSection: GuideSection = {
  id: "mbpr-notes",
  title: "MBPR — Notes",
  overview: Overview,
  guides: [
    {
      title: "Notes",
      description: "Typed, record-level notes on the MBPR.",
      content: Notes,
    },
  ],
};
