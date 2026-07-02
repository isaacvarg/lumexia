import { GuideSection } from "../../types";
import Overview from "./Overview";
import ItemProperties from "../../items/ItemProperties";
import Aliases from "../../items/Aliases";
import Notes from "./Notes";
import Activity from "./Activity";

export const basicsSection: GuideSection = {
  id: "item-basics",
  title: "Item details — Basics",
  overview: Overview,
  guides: [
    {
      title: "Item properties",
      description: "The core fields every item carries and what they control.",
      content: ItemProperties,
    },
    {
      title: "Aliases",
      description: "Alternate names and codes that resolve back to one item.",
      content: Aliases,
    },
    {
      title: "Notes",
      description: "Timestamped commentary attached to the item.",
      content: Notes,
    },
    {
      title: "Activity",
      description: "The item's change history, filterable by action and user.",
      content: Activity,
    },
  ],
};
