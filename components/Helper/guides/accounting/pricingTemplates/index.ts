import { GuideSection } from "../../types";
import Overview from "./Overview";
import Templates from "./Templates";

export const accountingPricingTemplatesSection: GuideSection = {
  id: "accounting-pricing-templates",
  title: "Pricing — Templates",
  overview: Overview,
  guides: [
    {
      title: "Pricing templates",
      description: "Reusable finished-product blueprints and Apply Template.",
      content: Templates,
    },
  ],
};
