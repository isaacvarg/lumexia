import { GuideSection } from "../../types";
import Overview from "./Overview";
import Reconciliation from "./Reconciliation";
import NotesFilesActivity from "./NotesFilesActivity";

export const accountingPosDetailSection: GuideSection = {
  id: "accounting-pos-detail",
  title: "PO Accounting — Detail",
  overview: Overview,
  guides: [
    {
      title: "Reconciliation",
      description: "The Details tab's toggles, status, and payment method.",
      content: Reconciliation,
    },
    {
      title: "Notes, files & activity",
      description: "Notes, paperwork copies, and the merged audit timeline.",
      content: NotesFilesActivity,
    },
  ],
};
