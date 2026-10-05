// End-to-end check of the Canon engine against the database in .env.
// Creates "__e2e "-prefixed data types and a team, runs the CR lifecycle, then deletes them.
// Run: npx tsx --env-file=.env scripts/canon/e2e.ts

import prisma from "@/lib/prisma";
import { canonShapes } from "@/configs/staticRecords/canonShapes";
import { canonSubjectTypes } from "@/configs/staticRecords/canonSubjectTypes";
import { canonDependencyKinds } from "@/configs/staticRecords/canonDependencyKinds";
import { canonCapabilities } from "@/configs/staticRecords/canonCapabilities";
import { canonSourceTypes } from "@/configs/staticRecords/canonSourceTypes";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { canonArtifactStatuses } from "@/configs/staticRecords/canonArtifactStatuses";
import { canonChangeRequestStatuses } from "@/configs/staticRecords/canonChangeRequestStatuses";
import { canonEventTypes } from "@/configs/staticRecords/canonEventTypes";
import { confirmStale, proposeEdit, proposeSourceAcceptance, reviewChangeRequest } from "@/lib/canon/changeRequests";
import { refreshArtifactStatus } from "@/lib/canon/status";
import { getArtifactHistory, getItemCanon } from "@/lib/canon/queries";
import { toSubjectKey } from "@/lib/canon/subjectKey";
import { createsCycle } from "@/lib/canon/graph";

const PREFIX = "__e2e ";
const nameOf = (id: string, map: Record<string, string>) => Object.entries(map).find(([, v]) => v === id)?.[0];
let failures = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
};
const statusOf = async (dataTypeId: string, subjectKey: string) => {
  const a = await prisma.canonArtifact.findUnique({ where: { dataTypeId_subjectKey: { dataTypeId, subjectKey } } });
  return a ? nameOf(a.statusId, canonArtifactStatuses) : "none";
};
const expectThrow = async (label: string, fn: () => Promise<unknown>) => {
  try { await fn(); check(label, false, "did not throw"); } catch (e) { check(label, true, (e as Error).message); }
};

const cleanup = async () => {
  const types = await prisma.canonDataType.findMany({ where: { name: { startsWith: PREFIX } }, select: { id: true } });
  const typeIds = types.map((t) => t.id);
  const artifacts = await prisma.canonArtifact.findMany({ where: { dataTypeId: { in: typeIds } }, select: { id: true } });
  const artifactIds = artifacts.map((a) => a.id);
  await prisma.canonArtifactEvent.deleteMany({ where: { artifactId: { in: artifactIds } } });
  await prisma.canonArtifact.updateMany({ where: { id: { in: artifactIds } }, data: { currentVersionId: null } });
  await prisma.canonVersionLineage.deleteMany({ where: { version: { artifactId: { in: artifactIds } } } });
  await prisma.canonArtifactVersion.deleteMany({ where: { artifactId: { in: artifactIds } } });
  await prisma.canonChangeRequest.deleteMany({ where: { artifactId: { in: artifactIds } } });
  await prisma.canonArtifact.deleteMany({ where: { id: { in: artifactIds } } });
  await prisma.canonDataTypeDependency.deleteMany({ where: { OR: [{ parentId: { in: typeIds } }, { childId: { in: typeIds } }] } });
  await prisma.canonDataType.deleteMany({ where: { id: { in: typeIds } } });
  await prisma.canonTeam.deleteMany({ where: { name: { startsWith: PREFIX } } });
};

const main = async () => {
  await cleanup();

  const [userA, userB] = await prisma.user.findMany({ take: 2, orderBy: { createdAt: "asc" } });
  const suppliers = await prisma.supplier.findMany({ take: 2 });
  const mbpr = await prisma.masterBatchProductionRecord.findFirstOrThrow({
    where: { recordStatusId: recordStatuses.active, BillOfMaterial: { some: { recordStatusId: recordStatuses.active } } },
    include: { BillOfMaterial: { where: { recordStatusId: recordStatuses.active }, take: 1 } },
  });
  const productId = mbpr.producesItemId;
  const materialId = mbpr.BillOfMaterial[0].itemId;
  const product = { kind: "item" as const, itemId: productId };
  const material = { kind: "item" as const, itemId: materialId };
  console.log(`users A=${userA.name} B=${userB.name}; product ${productId}; material ${materialId}; suppliers ${suppliers.length}`);

  // --- settings
  const team = await prisma.canonTeam.create({ data: { name: `${PREFIX}Regulatory`, members: { create: { userId: userB.id } } } });
  const mk = (name: string, shapeId: string, subjectTypeId: string, extra: object = {}) =>
    prisma.canonDataType.create({ data: { name: PREFIX + name, shapeId, subjectTypeId, recordStatusId: recordStatuses.active, ...extra } });

  const bom = await mk("Official BOM", canonShapes.billOfMaterials, canonSubjectTypes.item, { resolverKey: "mbpr.activeBom" });
  const listing = await mk("Ingredient Listing", canonShapes.orderedList, canonSubjectTypes.item, { requiresDifferentReviewer: true });
  const vegan = await mk("Vegan", canonShapes.boolean, canonSubjectTypes.item, { reverifyAfterDays: 1 });
  const supplierVegan = await mk("Supplier Vegan", canonShapes.boolean, canonSubjectTypes.itemSupplier, { requiresEvidence: true });
  const claim = await mk("Vegan Claim", canonShapes.boolean, canonSubjectTypes.item);

  await prisma.canonDataTypeDependency.createMany({
    data: [
      { parentId: bom.id, childId: listing.id, kindId: canonDependencyKinds.sameSubject },
      { parentId: supplierVegan.id, childId: vegan.id, kindId: canonDependencyKinds.suppliers },
      { parentId: vegan.id, childId: claim.id, kindId: canonDependencyKinds.activeBom },
    ],
  });
  check("cycle detection blocks listing → BOM", await createsCycle(prisma, listing.id, bom.id));
  check("no false cycle for BOM → claim", !(await createsCycle(prisma, bom.id, claim.id)));

  await prisma.canonDataTypeUserPermission.createMany({
    data: [
      { dataTypeId: listing.id, capabilityId: canonCapabilities.edit, userId: userA.id },
      { dataTypeId: bom.id, capabilityId: canonCapabilities.review, userId: userB.id },
      ...[vegan, supplierVegan, claim].map((t) => ({ dataTypeId: t.id, capabilityId: canonCapabilities.edit, userId: userA.id })),
    ],
  });
  await prisma.canonDataTypeTeamPermission.createMany({
    data: [listing, vegan, supplierVegan, claim].map((t) => ({ dataTypeId: t.id, capabilityId: canonCapabilities.review, teamId: team.id })),
  });

  // --- linked source acceptance (B is a BOM reviewer, so their own approval completes it)
  await expectThrow("A cannot accept BOM source (not a reviewer)", () =>
    proposeSourceAcceptance(userA.id, { dataTypeId: bom.id, subject: product, reason: "x" }));
  const bomCr = await proposeSourceAcceptance(userB.id, { dataTypeId: bom.id, subject: product, reason: "Initial acceptance" });
  check("BOM accepted on open (self-approval allowed)", !!bomCr.version, nameOf(bomCr.statusId, canonChangeRequestStatuses));

  // --- authored edit needing a different reviewer
  await expectThrow("edit content validated by shape", () =>
    proposeEdit(userA.id, { dataTypeId: listing.id, subject: product, reason: "x", proposedContent: { items: "nope" } }));
  await expectThrow("cannot edit a linked type", () =>
    proposeEdit(userB.id, { dataTypeId: bom.id, subject: product, reason: "x", proposedContent: { rows: [] } }));
  const listCr = await proposeEdit(userA.id, {
    dataTypeId: listing.id, subject: product, reason: "First listing", proposedContent: { items: ["Water", "Glycerin"] },
  });
  check("listing CR waits for review", !listCr.version);
  await expectThrow("rejection needs a comment", () => reviewChangeRequest(userB.id, { changeRequestId: listCr.id, approved: false }));
  await reviewChangeRequest(userB.id, { changeRequestId: listCr.id, approved: true });
  const listingKey = toSubjectKey(product);
  check("listing current after B approves", (await statusOf(listing.id, listingKey)) === "current");

  // --- linked source changes → unreviewed; acceptance → downstream stale
  const bomArtifact = await prisma.canonArtifact.findUniqueOrThrow({ where: { dataTypeId_subjectKey: { dataTypeId: bom.id, subjectKey: listingKey } } });
  await prisma.canonArtifact.update({ where: { id: bomArtifact.id }, data: { observedMarker: "simulated-edit" } });
  await refreshArtifactStatus(prisma, bomArtifact.id);
  check("BOM shows unreviewed change", (await statusOf(bom.id, listingKey)) === "unreviewedChange");
  check("listing not stale before acceptance", (await statusOf(listing.id, listingKey)) === "current");
  // the real source didn't change, so re-accepting creates v2 with the same content; lineage still moves
  await proposeSourceAcceptance(userB.id, { dataTypeId: bom.id, subject: product, reason: "Accept edit" });
  check("BOM current after acceptance", (await statusOf(bom.id, listingKey)) === "current");
  check("listing stale after BOM v2", (await statusOf(listing.id, listingKey)) === "stale");

  // --- stale confirmation
  const listingArtifact = await prisma.canonArtifact.findUniqueOrThrow({ where: { dataTypeId_subjectKey: { dataTypeId: listing.id, subjectKey: listingKey } } });
  const conf = await confirmStale(userA.id, { artifactId: listingArtifact.id, reason: "BOM change doesn't affect listing" });
  await reviewChangeRequest(userB.id, { changeRequestId: conf.id, approved: true });
  check("listing current after confirmation", (await statusOf(listing.id, listingKey)) === "current");

  // --- two open CRs: approving one outdates the other
  const c1 = await proposeEdit(userA.id, { dataTypeId: listing.id, subject: product, reason: "a", proposedContent: { items: ["Water"] } });
  const c2 = await proposeEdit(userA.id, { dataTypeId: listing.id, subject: product, reason: "b", proposedContent: { items: ["Aqua"] } });
  await reviewChangeRequest(userB.id, { changeRequestId: c1.id, approved: true });
  const c2After = await prisma.canonChangeRequest.findUniqueOrThrow({ where: { id: c2.id } });
  check("competing CR marked outdated", c2After.statusId === canonChangeRequestStatuses.outdated);

  // --- supplier facts: evidence required, conflict raised and resolved
  if (suppliers.length === 2) {
    await prisma.canonDataTypeUserPermission.create({ data: { dataTypeId: vegan.id, capabilityId: canonCapabilities.review, userId: userA.id } });
    await expectThrow("supplier fact requires evidence", () =>
      proposeEdit(userA.id, { dataTypeId: supplierVegan.id, subject: { kind: "itemSupplier", itemId: materialId, supplierId: suppliers[0].id }, reason: "x", proposedContent: { value: true } }));
    const ev = [{ sourceTypeId: canonSourceTypes.supplierDocument, note: "TDS", sourceDate: new Date("2025-01-01") }];
    for (const [i, value] of [[0, true], [1, false]] as const) {
      const cr = await proposeEdit(userA.id, { dataTypeId: supplierVegan.id, subject: { kind: "itemSupplier", itemId: materialId, supplierId: suppliers[i].id }, reason: "TDS", proposedContent: { value }, sources: ev });
      await reviewChangeRequest(userB.id, { changeRequestId: cr.id, approved: true });
    }
    // A also reviews Vegan, so their edit self-approves (requiresDifferentReviewer is off)
    const v1 = await proposeEdit(userA.id, { dataTypeId: vegan.id, subject: material, reason: "Initial", proposedContent: { value: true } });
    check("self-approved edit applied", !!v1.version);
    const materialKey = toSubjectKey(material);
    check("material Vegan shows conflict", (await statusOf(vegan.id, materialKey)) === "conflict");
    const s2 = await prisma.canonArtifact.findUniqueOrThrow({ where: { dataTypeId_subjectKey: { dataTypeId: supplierVegan.id, subjectKey: toSubjectKey({ kind: "itemSupplier", itemId: materialId, supplierId: suppliers[1].id }) } } });
    const fix = await proposeEdit(userA.id, { dataTypeId: supplierVegan.id, subject: { kind: "itemSupplier", itemId: materialId, supplierId: suppliers[1].id }, reason: "Supplier corrected", proposedContent: { value: true }, sources: ev });
    await reviewChangeRequest(userB.id, { changeRequestId: fix.id, approved: true });
    const resolved = await prisma.canonArtifactEvent.count({ where: { artifact: { dataTypeId: vegan.id }, eventTypeId: canonEventTypes.conflictResolved } });
    check("conflict resolved event logged", resolved === 1);
    check("material Vegan stale (supplier fact changed)", (await statusOf(vegan.id, materialKey)) === "stale");
    void s2;

    // --- active BOM propagation to the product's claim
    const claimCr = await proposeEdit(userA.id, { dataTypeId: claim.id, subject: product, reason: "Claim", proposedContent: { value: true } });
    await reviewChangeRequest(userB.id, { changeRequestId: claimCr.id, approved: true });
    check("claim current", (await statusOf(claim.id, listingKey)) === "current");
    const vegan2 = await proposeEdit(userA.id, { dataTypeId: vegan.id, subject: material, reason: "Recheck", proposedContent: { value: false } });
    check("material Vegan v2 applied", !!vegan2.version);
    check("product claim stale via active BOM", (await statusOf(claim.id, listingKey)) === "stale");

    // --- expiry: reverifyAfterDays=1 from a source date in the past
    const old = await proposeEdit(userA.id, { dataTypeId: vegan.id, subject: material, reason: "Old doc", proposedContent: { value: false }, sources: [{ sourceTypeId: canonSourceTypes.supplierDocument, sourceDate: new Date("2020-01-01") }] });
    check("old evidence applied", !!old.version);
    check("material Vegan expired", (await statusOf(vegan.id, materialKey)) === "expired");
  } else {
    console.log("SKIP  supplier/BOM-propagation checks (need 2 suppliers)");
  }

  // --- history + item canon
  const history = await getArtifactHistory(listingArtifact.id);
  check("history has versions newest first", history.versions.length === 3 && history.versions[0].versionNumber === 3, `${history.versions.length} versions`);
  check("history has lineage", history.versions[0].upstream.length === 1);
  check("history has events", history.events.length > 0, history.events.map((e) => e.eventType.name).reverse().join(" → "));
  const canon = await getItemCanon(userA.id, productId);
  const listingEntry = canon.item.find((e) => e.dataType.id === listing.id);
  check("item canon includes listing with permissions", !!listingEntry && listingEntry.canEdit && !listingEntry.canReview);
  const bomEntry = canon.item.find((e) => e.dataType.id === bom.id);
  check("item canon includes live BOM", !!bomEntry?.live);

  console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILED`);
};

main()
  .catch((e) => { console.error(e); failures++; })
  .finally(async () => { await cleanup(); await prisma.$disconnect(); process.exit(failures ? 1 : 0); });
