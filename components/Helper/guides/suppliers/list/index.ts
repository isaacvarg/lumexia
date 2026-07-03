import { GuideSection } from "../../types";
import Overview from "./Overview";
import AddingSupplier from "./AddingSupplier";

export const suppliersListSection: GuideSection = {
  id: "suppliers",
  title: "Suppliers",
  overview: Overview,
  guides: [
    {
      title: "Adding a supplier",
      description: "Only a name is required; other details are optional.",
      content: AddingSupplier,
    },
  ],
};
