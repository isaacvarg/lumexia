import { GuideSection } from "../../types";
import Overview from "./Overview";
import Examinations from "./Examinations";
import PricingProperties from "./PricingProperties";

export const pricingSection: GuideSection = {
  id: "item-pricing",
  title: "Item details — Pricing",
  overview: Overview,
  guides: [
    {
      title: "Examinations",
      description: "The last examination and the full examinations table.",
      content: Examinations,
    },
    {
      title: "Item pricing properties",
      description: "Cost adjustments and the upcoming price override.",
      content: PricingProperties,
    },
  ],
};
