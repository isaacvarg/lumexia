import { GuideSection } from "../../types";
import Overview from "./Overview";
import Purchases from "./Purchases";
import Contacts from "./Contacts";
import Notes from "./Notes";
import Items from "./Items";
import Aliases from "./Aliases";
import Settings from "./Settings";

export const supplierDetailsSection: GuideSection = {
  id: "supplier-details",
  title: "Supplier details",
  overview: Overview,
  guides: [
    {
      title: "Purchases",
      description: "Spend metrics and the supplier's order history.",
      content: Purchases,
    },
    {
      title: "Contacts",
      description: "People at the supplier, each with their own notes.",
      content: Contacts,
    },
    {
      title: "Notes",
      description: "General, supplier-level notes.",
      content: Notes,
    },
    {
      title: "Items",
      description: "Per-item buying history, pricing, and trends.",
      content: Items,
    },
    {
      title: "Aliases",
      description: "The supplier's names/codes for your items.",
      content: Aliases,
    },
    {
      title: "Settings",
      description: "Address, PO printing, and archiving the supplier.",
      content: Settings,
    },
  ],
};
