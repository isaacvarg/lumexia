import { GuideSection } from "../../types";
import Overview from "./Overview";
import Experiments from "./Experiments";

export const mbprRndSection: GuideSection = {
  id: "mbpr-rnd",
  title: "MBPR — R&D",
  overview: Overview,
  guides: [
    {
      title: "R&D experiments",
      description: "Experiments that use this MBPR version as an analog variant.",
      content: Experiments,
    },
  ],
};
