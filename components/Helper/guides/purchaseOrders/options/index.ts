import { GuideSection } from "../../types";
import Overview from "./Overview";
import DuplicateArchive from "./DuplicateArchive";

export const purchaseOrderOptionsSection: GuideSection = {
  id: "po-options",
  title: "Purchase order — Options",
  overview: Overview,
  guides: [
    {
      title: "Duplicate & archive",
      description: "Cloning an order into a new Draft, and archiving it off the board.",
      content: DuplicateArchive,
    },
  ],
};
