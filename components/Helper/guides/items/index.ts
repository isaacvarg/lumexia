import { GuideSection } from "../types";
import Overview from "./Overview";
import ItemProperties from "./ItemProperties";
import ProcurementTypes from "./ProcurementTypes";
import Aliases from "./Aliases";
import BrowsingItems from "./BrowsingItems";
import CreatingAnItem from "./CreatingAnItem";
import PropertyConfiguration from "./PropertyConfiguration";

export const itemsSection: GuideSection = {
  id: "items",
  title: "Learn how items work",
  overview: Overview,
  guides: [
    {
      title: "Item properties",
      description: "The core fields every item carries and what they control.",
      content: ItemProperties,
    },
    {
      title: "Procurement types",
      description: "How purchased vs produced shapes an item's workflows.",
      content: ProcurementTypes,
    },
    {
      title: "Aliases",
      description: "Alternate names and codes that resolve back to one item.",
      content: Aliases,
    },
    {
      title: "Browsing the items list",
      description: "Columns, filtering by type, and the global search.",
      content: BrowsingItems,
    },
    {
      title: "Creating an item",
      description: "Register a new material, component, or product.",
      content: CreatingAnItem,
    },
    {
      title: "Property configuration",
      description: "Configure item types, alias types, and file types.",
      content: PropertyConfiguration,
    },
  ],
};
