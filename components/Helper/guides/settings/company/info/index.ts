import { GuideSection } from "../../../types";
import Overview from "./Overview";
import FeedsLiveDocuments from "./FeedsLiveDocuments";

export const settingsCompanyInfoSection: GuideSection = {
  id: "settings-company-info",
  title: "Company Info",
  overview: Overview,
  guides: [
    {
      title: "Fields feed live documents",
      description: "These keys are read directly by the PO and CoA PDF generators.",
      content: FeedsLiveDocuments,
    },
  ],
};
