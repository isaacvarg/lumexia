import { GuideSection } from "../../types";
import Overview from "./Overview";
import SupplierTags from "./SupplierTags";

export const requestSupplierSection: GuideSection = {
  id: "request-supplier",
  title: "Requests — Supplier",
  overview: Overview,
  guides: [
    {
      title: "Supplier tags",
      description: "How requests are grouped by supplier, and the Untagged group.",
      content: SupplierTags,
    },
  ],
};
