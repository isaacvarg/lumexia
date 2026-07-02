import { GuideSection } from "../../types";
import Overview from "./Overview";
import Trends from "./Trends";
import PurchaseOrders from "./PurchaseOrders";

export const purchasingSection: GuideSection = {
  id: "item-purchasing",
  title: "Item details — Purchasing",
  overview: Overview,
  guides: [
    {
      title: "Trends",
      description: "Purchases, quantity, spend, and pricing across suppliers.",
      content: Trends,
    },
    {
      title: "Purchase orders",
      description: "The filterable table of the item's purchase orders.",
      content: PurchaseOrders,
    },
  ],
};
