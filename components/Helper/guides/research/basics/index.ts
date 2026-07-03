import { GuideSection } from "../../types";
import Overview from "./Overview";
import TheRecord from "./TheRecord";
import CopyForLlm from "./CopyForLlm";

export const experimentBasicsSection: GuideSection = {
  id: "experiment-basics",
  title: "Experiment — Basics",
  overview: Overview,
  guides: [
    {
      title: "The record",
      description: "Core fields, notes with shared note types, and files.",
      content: TheRecord,
    },
    {
      title: "Copy for LLM",
      description: "Exporting the experiment as markdown for an AI assistant.",
      content: CopyForLlm,
    },
  ],
};
