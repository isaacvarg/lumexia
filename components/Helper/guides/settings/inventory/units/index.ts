import { GuideSection } from "../../../types";
import Overview from "./Overview";
import GlobalVsPerItem from "./GlobalVsPerItem";

export const settingsInventoryUnitsSection: GuideSection = {
  id: "settings-inventory-units",
  title: "Units & Conversions",
  overview: Overview,
  guides: [
    {
      title: "Global vs. per-item conversions",
      description: "This table is base UOM math, not supplier pack sizes.",
      content: GlobalVsPerItem,
    },
  ],
};
