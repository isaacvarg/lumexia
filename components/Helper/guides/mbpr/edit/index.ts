import { GuideSection } from "../../types";
import Overview from "./Overview";
import Versions from "./Versions";
import StepsAndActions from "./StepsAndActions";
import BatchSizes from "./BatchSizes";

export const mbprEditSection: GuideSection = {
  id: "mbpr-edit",
  title: "Editing an MBPR",
  overview: Overview,
  guides: [
    {
      title: "Versions",
      description: "Add New vs Copy, and the one-active-version rule.",
      content: Versions,
    },
    {
      title: "Steps & actions",
      description: "Steps, phases, actionables, and the Complete Step rule.",
      content: StepsAndActions,
    },
    {
      title: "Batch sizes",
      description: "Sizes, vessels, and the one-active-size rule.",
      content: BatchSizes,
    },
  ],
};
