import { GuideSection } from "../../types";
import Overview from "./Overview";
import ProducedItems from "./ProducedItems";
import PurchasedItems from "./PurchasedItems";

export const productionSection: GuideSection = {
  id: "item-production",
  title: "Item details — Production",
  overview: Overview,
  guides: [
    {
      title: "Produced items",
      description: "The active MBPR, its bill of materials, and batches produced.",
      content: ProducedItems,
    },
    {
      title: "Purchased items",
      description: "How the item is consumed and used across production.",
      content: PurchasedItems,
    },
  ],
};
