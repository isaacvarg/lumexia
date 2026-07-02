import { GuideSection } from "../../types";
import Overview from "./Overview";
import UploadingFiles from "./UploadingFiles";

export const filesSection: GuideSection = {
  id: "item-files",
  title: "Item details — Files",
  overview: Overview,
  guides: [
    {
      title: "Uploading files",
      description: "Assign file types and apply tags to organize documents.",
      content: UploadingFiles,
    },
  ],
};
