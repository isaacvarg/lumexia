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

// How each subject type reads in the UI. The record names are fixed (their IDs derive from them),
// so clearer wording lives here.
export const subjectLabels: Record<string, { label: string; description: string }> = {
  [canonSubjectTypes.item]: {
    label: "Item",
    description: "One value per item: the formula or material itself, whatever size it's sold in. Facts from regulations, tests or literature go here, with their evidence.",
  },
  [canonSubjectTypes.finishedProduct]: {
    label: "Finished product (per size)",
    description: "One value per sellable size: things that differ between the 8 oz and the gallon, like label copy, net contents or price.",
  },
  [canonSubjectTypes.itemSupplier]: {
    label: "Item, per supplier (legacy)",
    description: "A value that only exists per supplier. For facts about the item, use Item with \"Suppliers can state this too\" instead.",
  },
};

// daisyUI color per subject, so item / finished product / supplier types are easy to tell apart
export const subjectColors: Record<string, { text: string; bg: string; border: string; ring: string }> = {
  [canonSubjectTypes.item]: { text: "text-primary", bg: "bg-primary/10", border: "border-primary", ring: "ring-primary/30" },
  [canonSubjectTypes.finishedProduct]: { text: "text-secondary", bg: "bg-secondary/10", border: "border-secondary", ring: "ring-secondary/30" },
  [canonSubjectTypes.itemSupplier]: { text: "text-accent", bg: "bg-accent/10", border: "border-accent", ring: "ring-accent/30" },
};

type KindLabel = {
  label: string
  description: string
  // the same explanation using the two types being connected, for the picker
  explain: (parent: string, child: string) => string
  dashed: boolean
}

export const dependencyKindLabels: Record<string, KindLabel> = {
  [canonDependencyKinds.sameSubject]: {
    label: "Same subject",
    description: "Each artifact depends on the parent artifact of the same item or finished product.",
    explain: (parent, child) => `An item's ${child} depends on that same item's ${parent}.`,
    dashed: false,
  },
  [canonDependencyKinds.activeBom]: {
    label: "Via active BOM",
    description: "A product's artifact depends on this artifact for every material in its active BOM.",
    explain: (parent, child) => `A product's ${child} depends on the ${parent} of every material in its active BOM.`,
    dashed: true,
  },
  [canonDependencyKinds.suppliers]: {
    label: "From suppliers",
    description: "An item's artifact depends on every supplier-stated artifact for that item.",
    explain: (parent, child) => `An item's ${child} depends on the ${parent} stated by each of its suppliers.`,
    dashed: true,
  },
  [canonDependencyKinds.filledItem]: {
    label: "Filled item",
    description: "A finished product's artifact depends on the artifact of the item it is filled with.",
    explain: (parent, child) => `A finished product's ${child} depends on the ${parent} of the item it's filled with.`,
    dashed: true,
  },
};
