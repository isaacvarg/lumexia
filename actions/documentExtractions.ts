"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getUserId } from "@/actions/users/getUserId";
import { ensureSeedCatalog, listFactDefinitions } from "@/lib/documentExtractions/catalog";
import { documentContent } from "@/lib/documentExtractions/content";
import { getExtraction } from "@/lib/documentExtractions/queries";
import { ExtractionRefused } from "@/lib/documentExtractions/store";
import type { FactKind, ValueSchema } from "@/lib/documentExtractions/types";
import {
  clearExtractionFailure,
  DefinitionEdit,
  mergeFactDefinition,
  OverrideInput,
  overrideFact,
  revertOverride,
  setFactDefinitionStatus,
  unverifyFact,
  updateFactDefinition,
  verifyFact,
} from "@/lib/documentExtractions/human";

// The people's side of document extractions: reading them in the Files tab and review queue, verifying and
// correcting facts, and keeping the fact catalog. Agents never reach these; they use the MCP tools.

type Result = { ok: true } | { ok: false; error: string };

// One transaction per change; a refusal comes back as a message for the person.
const change = async (fn: (tx: Prisma.TransactionClient, userId: string) => Promise<unknown>): Promise<Result> => {
  const userId = await getUserId();
  try {
    await prisma.$transaction((tx) => fn(tx, userId), { timeout: 20_000 });
    return { ok: true };
  } catch (error) {
    if (error instanceof ExtractionRefused) return { ok: false, error: error.message };
    console.error("document extraction change failed", error);
    return { ok: false, error: "Couldn't save. Please try again." };
  }
};

// The extraction of a document's file, as the document preview shows it.
export const getDocumentExtractionView = async (documentId: string) => {
  await getUserId();
  const document = await prisma.itemFile.findUnique({ where: { id: documentId }, select: { id: true, file: { select: { sha256: true } } } });
  if (!document) return { error: "That document no longer exists." } as const;
  let sha256 = document.file.sha256;
  if (!sha256) {
    try {
      sha256 = (await documentContent(documentId))?.sha256 ?? null;
    } catch {
      return { error: "The file couldn't be read from storage to look up its extraction." } as const;
    }
  }
  if (!sha256) return { error: "That document no longer exists." } as const;
  await ensureSeedCatalog();
  const view = await getExtraction(prisma, sha256, { includeHistory: true });
  if (!view.exists) return { ...view, definitions: {} };
  // the shapes of the keys on this extraction, so a person can correct values in the right form
  const keys = Array.from(new Set(view.extraction.facts.map((f) => f.key)));
  const definitions = await prisma.factDefinition.findMany({
    where: { key: { in: keys } },
    select: { key: true, kind: true, valueSchema: true, unitFamily: true },
  });
  return { ...view, definitions: Object.fromEntries(definitions.map((d) => [d.key, { kind: d.kind as FactKind, valueSchema: d.valueSchema as ValueSchema, unitFamily: d.unitFamily }])) };
};

export type DocumentExtractionView = Awaited<ReturnType<typeof getDocumentExtractionView>>;

export const getExtractionFullText = async (extractionId: string) => {
  await getUserId();
  const text = await prisma.documentExtractionText.findUnique({ where: { extractionId }, select: { fullText: true } });
  return text?.fullText ?? null;
};

export const verifyExtractedFact = async (factId: string) => change((tx, userId) => verifyFact(tx, userId, factId));
export const unverifyExtractedFact = async (factId: string) => change((tx, userId) => unverifyFact(tx, userId, factId));
export const overrideExtractedFact = async (factId: string, input: OverrideInput) => change((tx, userId) => overrideFact(tx, userId, factId, input));
export const revertExtractedFactOverride = async (factId: string) => change((tx, userId) => revertOverride(tx, userId, factId));
export const clearDocumentExtractionFailure = async (extractionId: string) => change((tx, userId) => clearExtractionFailure(tx, userId, extractionId));

// The catalog, for Settings → Inventory → Documents.
export const getFactCatalog = async () => {
  await ensureSeedCatalog();
  const [definitions, counts] = await Promise.all([
    listFactDefinitions(prisma, { includeProposed: true, includeDeprecated: true }),
    prisma.extractedFact.groupBy({ by: ["definitionId"], _count: { _all: true } }),
  ]);
  const factCount = new Map(counts.map((c) => [c.definitionId, c._count._all]));
  return definitions.map((d) => ({ ...d, facts: factCount.get(d.id) ?? 0 }));
};

export type FactCatalogEntry = Awaited<ReturnType<typeof getFactCatalog>>[number];

export const updateFactCatalogEntry = async (definitionId: string, edit: DefinitionEdit) => change((tx, userId) => updateFactDefinition(tx, userId, definitionId, edit));
export const approveFactCatalogEntry = async (definitionId: string) => change((tx, userId) => setFactDefinitionStatus(tx, userId, definitionId, "approved"));
export const deprecateFactCatalogEntry = async (definitionId: string) => change((tx, userId) => setFactDefinitionStatus(tx, userId, definitionId, "deprecated"));
export const mergeFactCatalogEntry = async (fromId: string, intoId: string) => change((tx, userId) => mergeFactDefinition(tx, userId, fromId, intoId));
