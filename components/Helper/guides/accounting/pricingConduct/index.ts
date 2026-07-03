import { GuideSection } from "../../types";
import Overview from "./Overview";
import Conducting from "./Conducting";
import PricingToMargin from "./PricingToMargin";

export const accountingPricingConductSection: GuideSection = {
  id: "accounting-pricing-conduct",
  title: "Pricing — Conduct",
  overview: Overview,
  guides: [
    {
      title: "Conducting an examination",
      description: "Purchased vs produced costing and how item cost is built.",
      content: Conducting,
    },
    {
      title: "Pricing to margin",
      description: "The Alter By control, the four figures, and the 15% target.",
      content: PricingToMargin,
    },
  ],
};
