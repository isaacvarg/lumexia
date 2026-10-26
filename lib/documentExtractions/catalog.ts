import prisma from "@/lib/prisma";
import type { Db } from "@/lib/canon/db";
import { seedCatalog } from "./seedCatalog";
import { KEY_PATTERN, nearDuplicates, valueSchemaProblems } from "./keys";
import type { FactDefinitionShape, FactKind, ValueSchema } from "./types";

// The fact catalog in the database: seeded keys, keys agents proposed, and how keys resolve (a merged key
// resolves to the key that replaced it).

export class CatalogRefused extends Error {
  constructor(message: string, readonly details?: unknown) {
    super(message);
  }
}

let seeding: Promise<void> | null = null;

// Adds seed keys this database doesn't have yet, with their document types. Keys that exist are left as
// people edited them. Runs once per process, before anything reads the catalog.
export const ensureSeedCatalog = () => {
  seeding ??= (async () => {
    const existing = new Set((await prisma.factDefinition.findMany({ select: { key: true } })).map((d) => d.key));
    const missing = seedCatalog.map((d, i) => ({ ...d, displayOrder: (i + 1) * 10 })).filter((d) => !existing.has(d.key));
    if (!missing.length) return;

    const fileTypes = await prisma.itemFileType.findMany({ select: { id: true, abbreviaton: true } });
    const typeId = new Map(fileTypes.filter((t) => t.abbreviaton).map((t) => [t.abbreviaton!.toUpperCase(), t.id]));

    await prisma.$transaction(async (tx) => {
      await tx.factDefinition.createMany({
        data: missing.map((d) => ({
          key: d.key,
          label: d.label,
          description: d.description,
          kind: d.kind,
          valueSchema: (d.valueSchema ?? {}) as object,
          unitFamily: d.unitFamily,
          safetyRelevant: d.safetyRelevant ?? true,
          displayOrder: d.displayOrder,
          status: "approved",
          source: "seed",
        })),
        skipDuplicates: true,
      });
      const created = await tx.factDefinition.findMany({ where: { key: { in: missing.map((d) => d.key) } }, select: { id: true, key: true } });
      const idByKey = new Map(created.map((d) => [d.key, d.id]));
      await tx.factDefinitionFileType.createMany({
        data: missing.flatMap((d) =>
          d.documentTypes
            .filter((abbr) => typeId.has(abbr))
            .map((abbr) => ({ factDefinitionId: idByKey.get(d.key)!, fileTypeId: typeId.get(abbr)!, required: !!d.required?.includes(abbr) })),
        ),
        skipDuplicates: true,
      });
    });
  })().catch((error) => {
    seeding = null;
    throw error;
  });
  return seeding;
};

const shapeOf = (d: {
  id: string;
  key: string;
  label: string;
  kind: string;
  valueSchema: unknown;
  unitFamily: string | null;
  safetyRelevant: boolean;
  status: string;
}): FactDefinitionShape => ({
  id: d.id,
  key: d.key,
  label: d.label,
  kind: d.kind as FactKind,
  valueSchema: (d.valueSchema ?? {}) as ValueSchema,
  unitFamily: d.unitFamily,
  safetyRelevant: d.safetyRelevant,
  status: d.status as FactDefinitionShape["status"],
});

const definitionSelect = {
  id: true,
  key: true,
  label: true,
  kind: true,
  valueSchema: true,
  unitFamily: true,
  safetyRelevant: true,
  status: true,
  mergedIntoId: true,
} as const;

// Resolves keys for storing facts. Merged keys follow their replacement; deprecated and unknown keys come
// back in `unknown` / `deprecated` so the caller can refuse them.
export const resolveKeys = async (db: Db, keys: string[]) => {
  await ensureSeedCatalog();
  const all = await db.factDefinition.findMany({ select: definitionSelect });
  const byKey = new Map(all.map((d) => [d.key, d]));
  const byId = new Map(all.map((d) => [d.id, d]));
  const resolved = new Map<string, FactDefinitionShape>();
  const unknown: string[] = [];
  const deprecated: string[] = [];

  for (const key of Array.from(new Set(keys))) {
    let definition = byKey.get(key);
    const seen = new Set<string>();
    while (definition?.mergedIntoId && !seen.has(definition.id)) {
      seen.add(definition.id);
      definition = byId.get(definition.mergedIntoId);
    }
    if (!definition) unknown.push(key);
    else if (definition.status === "deprecated") deprecated.push(key);
    else resolved.set(key, shapeOf(definition));
  }
  return { resolved, unknown, deprecated };
};

export const listFactDefinitions = async (
  db: Db,
  filter: { fileTypeId?: string; includeProposed?: boolean; includeDeprecated?: boolean } = {},
) => {
  await ensureSeedCatalog();
  const statuses = ["approved", ...(filter.includeProposed === false ? [] : ["proposed"]), ...(filter.includeDeprecated ? ["deprecated"] : [])];
  return db.factDefinition.findMany({
    where: {
      status: { in: statuses },
      ...(filter.includeDeprecated ? {} : { mergedIntoId: null }),
      ...(filter.fileTypeId && { fileTypes: { some: { fileTypeId: filter.fileTypeId } } }),
    },
    select: {
      ...definitionSelect,
      description: true,
      displayOrder: true,
      source: true,
      mergedInto: { select: { key: true } },
      fileTypes: { select: { required: true, fileType: { select: { id: true, name: true, abbreviaton: true } } } },
    },
    orderBy: [{ displayOrder: "asc" }, { key: "asc" }],
  });
};

// Required keys for the given document types.
export const requiredKeysFor = async (db: Db, fileTypeIds: string[]) => {
  if (!fileTypeIds.length) return new Map<string, string[]>();
  const links = await db.factDefinitionFileType.findMany({
    where: { fileTypeId: { in: fileTypeIds }, required: true, factDefinition: { status: { not: "deprecated" }, mergedIntoId: null } },
    select: { fileTypeId: true, factDefinition: { select: { key: true } } },
  });
  const byType = new Map<string, string[]>();
  for (const link of links) byType.set(link.fileTypeId, [...(byType.get(link.fileTypeId) ?? []), link.factDefinition.key]);
  return byType;
};

export type NewDefinitionInput = {
  key: string;
  label: string;
  description: string;
  kind: FactKind;
  valueSchema?: ValueSchema;
  unitFamily?: string | null;
  documentTypes?: string[];
  confirmNew?: boolean;
  reason?: string;
};

// An agent's new key: usable at once as proposed, and safety-relevant until a person decides otherwise.
// Near-duplicates are refused unless the agent confirms with a reason why none of them fits.
export const createFactDefinition = async (
  db: Db,
  actor: { userId: string; apiKeyId?: string | null; onBehalfOfId?: string | null },
  input: NewDefinitionInput,
) => {
  await ensureSeedCatalog();
  const key = input.key.trim();
  if (!KEY_PATTERN.test(key)) throw new CatalogRefused("key must be lower_snake_case, 2–63 characters, starting with a letter.");
  const schema = input.valueSchema ?? {};
  const problems = valueSchemaProblems(input.kind, schema, input.unitFamily);
  if (problems.length) throw new CatalogRefused(`The value schema doesn't fit: ${problems.join("; ")}.`);

  const existing = await db.factDefinition.findMany({ select: { id: true, key: true, label: true, kind: true, status: true, mergedIntoId: true } });
  if (existing.some((d) => d.key === key)) throw new CatalogRefused(`Key ${key} already exists. Use it, or see list_fact_definitions.`);
  const candidates = nearDuplicates({ key, label: input.label }, existing.filter((d) => !d.mergedIntoId));
  if (candidates.length && !(input.confirmNew && input.reason?.trim())) {
    throw new CatalogRefused(
      "These keys look like the same fact. Use one of them, or pass confirmNew with a reason saying why none fits.",
      { candidates: candidates.map((c) => ({ key: c.key, label: c.label, kind: c.kind, status: c.status })) },
    );
  }

  const fileTypes = input.documentTypes?.length
    ? await db.itemFileType.findMany({ select: { id: true, name: true, abbreviaton: true } })
    : [];
  const fileTypeIds = (input.documentTypes ?? []).map((wanted) => {
    const match = fileTypes.find(
      (t) => t.id === wanted || t.abbreviaton?.toLowerCase() === wanted.toLowerCase() || t.name.toLowerCase() === wanted.toLowerCase(),
    );
    if (!match) throw new CatalogRefused(`No document type "${wanted}". See list_document_types.`);
    return match.id;
  });

  const definition = await db.factDefinition.create({
    data: {
      key,
      label: input.label.trim(),
      description: input.description.trim(),
      kind: input.kind,
      valueSchema: schema as object,
      unitFamily: input.unitFamily ?? null,
      safetyRelevant: true,
      status: "proposed",
      source: "agent",
      createdById: actor.userId,
      fileTypes: { create: Array.from(new Set(fileTypeIds)).map((fileTypeId) => ({ fileTypeId })) },
    },
    select: { ...definitionSelect, description: true },
  });
  await db.documentExtractionEvent.create({
    data: {
      type: "key_created",
      factDefinitionId: definition.id,
      actorId: actor.userId,
      apiKeyId: actor.apiKeyId ?? null,
      onBehalfOfId: actor.onBehalfOfId ?? null,
      reason: input.reason?.trim() || null,
      payload: { key, kind: input.kind, ...(candidates.length && { confirmedOver: candidates.map((c) => c.key) }) },
    },
  });
  return { definition, confirmedOver: candidates.map((c) => c.key) };
};
