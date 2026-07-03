import { GuideSection } from "../../../types";
import Overview from "./Overview";
import PricingExamTrigger from "./PricingExamTrigger";

export const settingsInventoryConfigurationSection: GuideSection = {
  id: "settings-inventory-configuration",
  title: "Inventory Configuration",
  overview: Overview,
  guides: [
    {
      title: "Item Types & the pricing-exam trigger",
      description: "The toggle that fires at PO reception, not at edit time.",
      content: PricingExamTrigger,
    },
  ],
};
