import { GuideSection } from "../../types";
import Overview from "./Overview";
import NoteVisibility from "./NoteVisibility";

export const purchaseOrderNotesSection: GuideSection = {
  id: "po-notes",
  title: "Purchase order — Notes",
  overview: Overview,
  guides: [
    {
      title: "Note visibility",
      description: "Internal, public, and supplier notes — and who sees each.",
      content: NoteVisibility,
    },
  ],
};
