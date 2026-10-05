import { IconType } from "react-icons";
import {
  TbClipboardList,
  TbFlask2,
  TbLayoutList,
  TbLetterT,
  TbListDetails,
  TbListNumbers,
  TbTags,
  TbTextCaption,
  TbToggleLeft,
} from "react-icons/tb";
import { canonShapes } from "@/configs/staticRecords/canonShapes";
import { canonSubjectTypes } from "@/configs/staticRecords/canonSubjectTypes";
import { canonDependencyKinds } from "@/configs/staticRecords/canonDependencyKinds";

export const shapeIcons: Record<string, IconType> = {
  [canonShapes.text]: TbLetterT,
  [canonShapes.richText]: TbTextCaption,
  [canonShapes.boolean]: TbToggleLeft,
  [canonShapes.orderedList]: TbListNumbers,
  [canonShapes.tagSet]: TbTags,
  [canonShapes.blockList]: TbLayoutList,
  [canonShapes.keyValue]: TbListDetails,
  [canonShapes.composition]: TbFlask2,
  [canonShapes.billOfMaterials]: TbClipboardList,
};

// daisyUI color per subject, so item / finished product / supplier types are easy to tell apart
export const subjectColors: Record<string, { text: string; bg: string; border: string; ring: string }> = {
  [canonSubjectTypes.item]: { text: "text-primary", bg: "bg-primary/10", border: "border-primary", ring: "ring-primary/30" },
  [canonSubjectTypes.finishedProduct]: { text: "text-secondary", bg: "bg-secondary/10", border: "border-secondary", ring: "ring-secondary/30" },
  [canonSubjectTypes.itemSupplier]: { text: "text-accent", bg: "bg-accent/10", border: "border-accent", ring: "ring-accent/30" },
};

export const dependencyKindLabels: Record<string, { label: string; description: string; dashed: boolean }> = {
  [canonDependencyKinds.sameSubject]: {
    label: "Same subject",
    description: "Each artifact depends on the parent artifact of the same item or finished product.",
    dashed: false,
  },
  [canonDependencyKinds.activeBom]: {
    label: "Via active BOM",
    description: "A product's artifact depends on this artifact for every material in its active BOM.",
    dashed: true,
  },
  [canonDependencyKinds.suppliers]: {
    label: "From suppliers",
    description: "An item's artifact depends on every supplier-stated artifact for that item.",
    dashed: true,
  },
  [canonDependencyKinds.filledItem]: {
    label: "Filled item",
    description: "A finished product's artifact depends on the artifact of the item it is filled with.",
    dashed: true,
  },
};
