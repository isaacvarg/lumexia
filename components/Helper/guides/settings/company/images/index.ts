import { GuideSection } from "../../../types";
import Overview from "./Overview";
import UploadMechanics from "./UploadMechanics";

export const settingsCompanyImagesSection: GuideSection = {
  id: "settings-company-images",
  title: "Company Images",
  overview: Overview,
  guides: [
    {
      title: "Upload mechanics",
      description: "Each slot saves independently, no batch confirm.",
      content: UploadMechanics,
    },
  ],
};
