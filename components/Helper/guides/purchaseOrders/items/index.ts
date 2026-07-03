import { GuideSection } from "../../types";
import Overview from "./Overview";
import LineItems from "./LineItems";
import PipelineAndDocument from "./PipelineAndDocument";

export const purchaseOrderItemsSection: GuideSection = {
  id: "po-items",
  title: "Purchase order — Items",
  overview: Overview,
  guides: [
    {
      title: "Line items",
      description: "Adding items, the fields on each line, and units.",
      content: LineItems,
    },
    {
      title: "Pipeline & PO document",
      description: "Moving the order through its stages and generating the PDF.",
      content: PipelineAndDocument,
    },
  ],
};
