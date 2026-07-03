import { GuideSection } from "../../types";
import Overview from "./Overview";
import FindingWhatToReceive from "./FindingWhatToReceive";

export const receivingDashboardSection: GuideSection = {
  id: "receiving",
  title: "Receiving",
  overview: Overview,
  guides: [
    {
      title: "Finding what to receive",
      description: "The Awaiting/Received tabs and when an order shows up here.",
      content: FindingWhatToReceive,
    },
  ],
};
