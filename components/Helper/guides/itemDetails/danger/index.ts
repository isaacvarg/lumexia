import { GuideSection } from "../../types";
import Overview from "./Overview";
import DangerActions from "./DangerActions";

export const dangerSection: GuideSection = {
  id: "item-danger",
  title: "Item details — Danger zone",
  overview: Overview,
  guides: [
    {
      title: "Danger zone actions",
      description: "Archive, change inventory UOM, and export the data package.",
      content: DangerActions,
    },
  ],
};
