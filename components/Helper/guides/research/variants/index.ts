import { GuideSection } from "../../types";
import Overview from "./Overview";
import FormulationAndMethod from "./FormulationAndMethod";
import AnalogFromMbpr from "./AnalogFromMbpr";

export const experimentVariantsSection: GuideSection = {
  id: "experiment-variants",
  title: "Experiment — Variants",
  overview: Overview,
  guides: [
    {
      title: "Formulation & method",
      description: "Materials at % w/w, phases, and the ordered method.",
      content: FormulationAndMethod,
    },
    {
      title: "Analog from an MBPR",
      description: "Cloning a recipe into a variant — a one-time copy.",
      content: AnalogFromMbpr,
    },
  ],
};
