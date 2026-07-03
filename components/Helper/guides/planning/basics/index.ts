import { GuideSection } from "../../types";
import Overview from "./Overview";
import BillOfMaterials from "./BillOfMaterials";
import MaterialAllocations from "./MaterialAllocations";

export const bprBasicsSection: GuideSection = {
  id: "bpr-basics",
  title: "Batch — Basics",
  overview: Overview,
  guides: [
    {
      title: "Bill of materials & sufficiency",
      description: "The sufficiency table, its columns, and line statuses.",
      content: BillOfMaterials,
    },
    {
      title: "Material allocations",
      description: "The per-material dialog and acting on a shortfall.",
      content: MaterialAllocations,
    },
  ],
};
