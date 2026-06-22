import { GuideSection } from "../types";
import AddingItem from "./AddingItem";
import ItemTypes from "./ItemTypes";

export const itemsSection: GuideSection = {
  id: "items",
  title: "Learn how items work",
  guides: [
    {
      title: "Creating an item",
      description: "Register a new material, component, or product.",
      content: AddingItem,
    },
    {
      title: "Item types explained",
      description: "How an item's type shapes its workflows.",
      content: ItemTypes,
    },
  ],
};
