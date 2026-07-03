import { GuideSection } from "../../types";
import Overview from "./Overview";
import RequestStatuses from "./RequestStatuses";

export const requestStatusSection: GuideSection = {
  id: "request-status",
  title: "Requests — Status",
  overview: Overview,
  guides: [
    {
      title: "Request statuses",
      description: "The 15-stage pipeline and which statuses archive a request.",
      content: RequestStatuses,
    },
  ],
};
