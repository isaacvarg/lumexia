import { GuideSection } from "../../types";
import Overview from "./Overview";
import CreatingRequests from "./CreatingRequests";

export const requestNewSection: GuideSection = {
  id: "request-new",
  title: "Requests — New",
  overview: Overview,
  guides: [
    {
      title: "Creating a request",
      description: "Standard vs general requests and the creation wizard.",
      content: CreatingRequests,
    },
  ],
};
