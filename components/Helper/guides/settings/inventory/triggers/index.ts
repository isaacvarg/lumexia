import { GuideSection } from "../../../types";
import Overview from "./Overview";
import CategoryGateAndCron from "./CategoryGateAndCron";

export const settingsInventoryTriggersSection: GuideSection = {
  id: "settings-inventory-triggers",
  title: "Inventory Audit Triggers",
  overview: Overview,
  guides: [
    {
      title: "Category gate & cron behavior",
      description: "Which items are actually evaluated, and how duplicates are avoided.",
      content: CategoryGateAndCron,
    },
  ],
};
