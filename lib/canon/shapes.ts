import { z } from "zod";
import { canonShapes } from "@/configs/staticRecords/canonShapes";

// Content schemas for each CanonShape. These validate CanonArtifactVersion.content
// and CanonChangeRequest.proposedContent, and drive copy text and diffs.

const text = z.object({ text: z.string() });

// stored as HTML from the rich text editor; copy uses the plain-text projection
const richText = z.object({ html: z.string(), plain: z.string() });

const boolean = z.object({ value: z.boolean() });

const orderedList = z.object({ items: z.array(z.string().min(1)) });

// allowed tags come from CanonDataType.shapeConfig.options
const tagSet = z.object({ tags: z.array(z.string().min(1)) });

const blockList = z.object({
  blocks: z.array(z.object({ title: z.string(), body: z.string() })),
});

const keyValue = z.object({
  rows: z.array(z.object({ key: z.string().min(1), value: z.string() })),
});

// SDS section 3 often states ranges, so a single percent is min === max
const composition = z.object({
  rows: z.array(
    z.object({
      inci: z.string().min(1),
      cas: z.string().nullable(),
      percentMin: z.number().min(0).max(100).nullable(),
      percentMax: z.number().min(0).max(100).nullable(),
    }),
  ),
});

const billOfMaterials = z.object({
  rows: z.array(
    z.object({
      identifier: z.string(),
      itemId: z.string(),
      itemName: z.string(),
      concentration: z.number(),
      stepSequence: z.number(),
      phase: z.string().nullable(),
    }),
  ),
});

export const shapeSchemas = {
  text,
  richText,
  boolean,
  orderedList,
  tagSet,
  blockList,
  keyValue,
  composition,
  billOfMaterials,
} satisfies Record<keyof typeof canonShapes, z.ZodTypeAny>;

export type CanonShapeKey = keyof typeof shapeSchemas;
export type CanonContent<K extends CanonShapeKey> = z.infer<(typeof shapeSchemas)[K]>;

// shape options stored on CanonDataType.shapeConfig
export const tagSetConfig = z.object({ options: z.array(z.string().min(1)) });

const shapeKeyById = Object.fromEntries(
  Object.entries(canonShapes).map(([key, id]) => [id, key]),
) as Record<string, CanonShapeKey>;

export const getShapeKey = (shapeId: string): CanonShapeKey => {
  const key = shapeKeyById[shapeId];
  if (!key) throw new Error(`Unknown canon shape id: ${shapeId}`);
  return key;
};

export const parseContent = <K extends CanonShapeKey>(shapeKey: K, content: unknown): CanonContent<K> => {
  return shapeSchemas[shapeKey].parse(content) as CanonContent<K>;
};

// tag sets must stay within the data type's vocabulary
export const validateTagSet = (content: CanonContent<"tagSet">, shapeConfig: unknown) => {
  const { options } = tagSetConfig.parse(shapeConfig);
  const unknownTags = content.tags.filter((tag) => !options.includes(tag));
  if (unknownTags.length > 0) {
    throw new Error(`Tags not in this data type's vocabulary: ${unknownTags.join(", ")}`);
  }
};

const formatPercent = (min: number | null, max: number | null) => {
  if (min === null && max === null) return "";
  if (min === max || max === null) return `${min}%`;
  if (min === null) return `≤${max}%`;
  return `${min}–${max}%`;
};

// The text a viewer gets from the copy button.
export const toCopyText = (shapeKey: CanonShapeKey, content: unknown): string => {
  switch (shapeKey) {
    case "text":
      return parseContent("text", content).text;
    case "richText":
      return parseContent("richText", content).plain;
    case "boolean":
      return parseContent("boolean", content).value ? "Yes" : "No";
    case "orderedList":
      return parseContent("orderedList", content).items.join(", ");
    case "tagSet":
      return parseContent("tagSet", content).tags.join(", ");
    case "blockList":
      return parseContent("blockList", content).blocks.map((b) => `${b.title}\n${b.body}`).join("\n\n");
    case "keyValue":
      return parseContent("keyValue", content).rows.map((r) => `${r.key}: ${r.value}`).join("\n");
    case "composition":
      return parseContent("composition", content)
        .rows.map((r) => [r.inci, r.cas, formatPercent(r.percentMin, r.percentMax)].filter(Boolean).join("\t"))
        .join("\n");
    case "billOfMaterials":
      return parseContent("billOfMaterials", content)
        .rows.map((r) => `${r.identifier}\t${r.itemName}\t${r.concentration}%`)
        .join("\n");
  }
};

export type CanonDiffLine = { kind: "added" | "removed" | "changed" | "unchanged"; label: string; before?: string; after?: string };

// Comparable lines per shape; the diff matches lines by label.
const toLines = (shapeKey: CanonShapeKey, content: unknown): { label: string; value: string }[] => {
  switch (shapeKey) {
    case "text":
    case "richText":
    case "boolean":
      return [{ label: "value", value: toCopyText(shapeKey, content) }];
    case "orderedList":
      return parseContent("orderedList", content).items.map((item, i) => ({ label: item, value: String(i + 1) }));
    case "tagSet":
      return parseContent("tagSet", content).tags.map((tag) => ({ label: tag, value: tag }));
    case "blockList":
      return parseContent("blockList", content).blocks.map((b) => ({ label: b.title, value: b.body }));
    case "keyValue":
      return parseContent("keyValue", content).rows.map((r) => ({ label: r.key, value: r.value }));
    case "composition":
      return parseContent("composition", content).rows.map((r) => ({
        label: r.inci,
        value: [r.cas ?? "", formatPercent(r.percentMin, r.percentMax)].join(" "),
      }));
    case "billOfMaterials":
      return parseContent("billOfMaterials", content).rows.map((r) => ({
        label: r.itemName,
        value: `${r.concentration}% (step ${r.stepSequence})`,
      }));
  }
};

// For ordered lists, a changed value means the item moved position.
export const diffContent = (shapeKey: CanonShapeKey, before: unknown | null, after: unknown): CanonDiffLine[] => {
  const beforeLines = before === null ? [] : toLines(shapeKey, before);
  const afterLines = toLines(shapeKey, after);
  const beforeByLabel = new Map(beforeLines.map((l) => [l.label, l.value]));
  const afterLabels = new Set(afterLines.map((l) => l.label));

  const lines: CanonDiffLine[] = afterLines.map(({ label, value }) => {
    if (!beforeByLabel.has(label)) return { kind: "added", label, after: value };
    const previous = beforeByLabel.get(label)!;
    return previous === value
      ? { kind: "unchanged", label, after: value }
      : { kind: "changed", label, before: previous, after: value };
  });

  for (const { label, value } of beforeLines) {
    if (!afterLabels.has(label)) lines.push({ kind: "removed", label, before: value });
  }

  return lines;
};
