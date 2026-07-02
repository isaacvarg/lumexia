import { GuideSection } from "../../types";
import Overview from "./Overview";
import QuantityCards from "./QuantityCards";
import Lots from "./Lots";
import Audits from "./Audits";
import DiscreteConversions from "./DiscreteConversions";
import ReorderingRule from "./ReorderingRule";

export const inventorySection: GuideSection = {
  id: "item-inventory",
  title: "Item details — Inventory",
  overview: Overview,
  guides: [
    {
      title: "Quantity cards",
      description: "The six figures that summarize the item's stock position.",
      content: QuantityCards,
    },
    {
      title: "Lots & lot details",
      description: "Manage lots, print labels, and record transactions.",
      content: Lots,
    },
    {
      title: "Audits",
      description: "The history of inventory audits on the item.",
      content: Audits,
    },
    {
      title: "Discrete conversions",
      description: "Supplier-specific unit conversions applied at receiving.",
      content: DiscreteConversions,
    },
    {
      title: "Reordering rule",
      description: "Automate audits and purchasing requests when stock is low.",
      content: ReorderingRule,
    },
  ],
};
