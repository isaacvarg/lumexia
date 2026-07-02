import { GuideSection } from "../../types";
import Overview from "./Overview";
import NewExperiment from "./NewExperiment";

export const rndSection: GuideSection = {
  id: "item-rnd",
  title: "Item details — R&D",
  overview: Overview,
  guides: [
    {
      title: "New experiment",
      description: "Start an experiment with this item as the subject.",
      content: NewExperiment,
    },
  ],
};
