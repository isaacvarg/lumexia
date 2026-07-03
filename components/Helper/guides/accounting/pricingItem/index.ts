import { GuideSection } from "../../types";
import Overview from "./Overview";
import ItemPricingHistory from "./ItemPricingHistory";

export const accountingPricingItemSection: GuideSection = {
  id: "accounting-pricing-item",
  title: "Pricing — Item overview",
  overview: Overview,
  guides: [
    {
      title: "Item pricing history",
      description: "Trend charts and the examination history for one item.",
      content: ItemPricingHistory,
    },
  ],
};
