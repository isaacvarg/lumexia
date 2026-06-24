import prisma from "@/lib/prisma";
import { s3 } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import JSZip from "jszip";
import { Readable } from "stream";

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function GET(
  _req: Request,
  { params }: { params: { itemId: string } }
) {
  const { itemId } = params;

  const [pricingData, lastExamination, finishedProducts, mbpr, itemFiles] =
    await Promise.all([
      prisma.itemPricingData.findFirst({
        where: { itemId },
        include: { upcomingPriceUom: true },
      }),
      prisma.pricingExamination.findFirst({
        where: { examinedItemId: itemId },
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
      prisma.finishedProduct.findMany({
        where: { filledWithItemId: itemId },
        include: {
          fillUom: true,
          auxiliaries: {
            include: {
              auxiliaryItem: {
                include: { itemPricingData: true },
              },
            },
          },
        },
      }),
      prisma.masterBatchProductionRecord.findFirst({
        where: {
          producesItemId: itemId,
          recordStatusId: recordStatuses.active,
        },
        include: {
          BatchSize: {
            include: { uom: true },
          },
          BatchStep: {
            include: { StepInstruction: true },
            orderBy: { sequence: "asc" },
          },
          BillOfMaterial: {
            include: { item: true, step: true },
            orderBy: { identifier: "asc" },
          },
        },
      }),
      prisma.itemFile.findMany({
        where: { itemId },
        include: { file: true },
      }),
    ]);

  const bomItemIds = Array.from(new Set(mbpr?.BillOfMaterial.map((b) => b.item.id) ?? []));
  const bomItemFiles = bomItemIds.length > 0
    ? await prisma.itemFile.findMany({
        where: { itemId: { in: bomItemIds } },
        include: { file: true, item: true },
      })
    : [];

  // ── pricing.json ──────────────────────────────────────────────────────────

  const pricingJson = {
    itemId,
    pricingData: pricingData
      ? {
          arrivalCost: pricingData.arrivalCost,
          productionUsageCost: pricingData.productionUsageCost,
          auxiliaryUsageCost: pricingData.auxiliaryUsageCost,
          unforeseenDifficultiesCost: pricingData.unforeseenDifficultiesCost,
          isUpcomingPriceActive: pricingData.isUpcomingPriceActive,
          upcomingPrice: pricingData.upcomingPrice,
          upcomingPriceUom: pricingData.upcomingPriceUom.abbreviation,
          overallItemCost: pricingData.overallItemCost,
        }
      : null,
    lastExamination: lastExamination
      ? {
          id: lastExamination.id,
          createdAt: lastExamination.createdAt,
          examiner: lastExamination.user?.name ?? null,
        }
      : null,
    finishedProducts: finishedProducts.map((fp) => {
      const missingAuxiliaryPricing = fp.auxiliaries.some(
        (a) => a.auxiliaryItem.itemPricingData.length === 0
      );
      return {
        name: fp.name,
        consumerPrice: fp.consumerPrice,
        fillQuantity: fp.fillQuantity,
        declaredQuantity: fp.declaredQuantity,
        finishedProductTotalCost: fp.finishedProductTotalCost,
        markup: fp.markup,
        profit: fp.profit,
        profitPercentage: fp.profitPercentage,
        auxiliaries: {
          total: fp.auxiliariesTotalCost,
          breakdown: fp.auxiliaries.map((a) => ({
            name: a.auxiliaryItem.name,
            quantity: a.quantity,
            difficultyAdjustmentCost: a.difficultyAdjustmentCost,
          })),
        },
        missingAuxiliaryPricing,
      };
    }),
  };

  // ── production.json ───────────────────────────────────────────────────────

  const batchSize = mbpr?.BatchSize[0] ?? null;

  const productionJson = {
    itemId,
    activeMbpr: mbpr
      ? {
          id: mbpr.id,
          versionLabel: mbpr.versionLabel ?? null,
          batchSize: batchSize
            ? {
                quantity: batchSize.quantity,
                uom: batchSize.uom.abbreviation,
              }
            : null,
          workInstructions: mbpr.BatchStep.map((step) => ({
            stepSequence: step.sequence,
            phase: step.phase,
            label: step.label ?? null,
            instructions: step.StepInstruction.map(
              (si) => si.instructionContent
            ),
          })),
          billOfMaterials: mbpr.BillOfMaterial.map((bom) => ({
            identifier: bom.identifier,
            itemName: bom.item.name,
            concentration: bom.concentration,
            phase: bom.step.phase,
            stepSequence: bom.step.sequence,
          })),
        }
      : null,
  };

  // ── zip assembly ──────────────────────────────────────────────────────────

  const zip = new JSZip();
  const root = zip.folder("data-verification-package")!;

  root.file("pricing.json", JSON.stringify(pricingJson, null, 2));
  root.file("production.json", JSON.stringify(productionJson, null, 2));

  const filesFolder = root.folder("files")!;

  await Promise.all(
    itemFiles.map(async (itemFile) => {
      try {
        const { Body } = await s3.send(new GetObjectCommand({
          Bucket: itemFile.file.bucketName,
          Key: itemFile.file.objectName,
        }));
        const buffer = await streamToBuffer(Body as unknown as Readable);
        filesFolder.file(itemFile.file.name, buffer);
      } catch {
        // skip files that can't be retrieved
      }
    })
  );

  const bomFilesFolder = root.folder("bom-files")!;

  await Promise.all(
    bomItemFiles.map(async (itemFile) => {
      try {
        const { Body } = await s3.send(new GetObjectCommand({
          Bucket: itemFile.file.bucketName,
          Key: itemFile.file.objectName,
        }));
        const buffer = await streamToBuffer(Body as unknown as Readable);
        const itemFolder = bomFilesFolder.folder(itemFile.item.name)!;
        itemFolder.file(itemFile.file.name, buffer);
      } catch {
        // skip files that can't be retrieved
      }
    })
  );

  const zipBuffer = await zip.generateAsync({ type: "uint8array" });

  // JSZip types the result as Uint8Array<ArrayBufferLike>; the Response/BlobPart
  // types require a concrete ArrayBuffer-backed view. The buffer is never a
  // SharedArrayBuffer at runtime, so this narrowing cast is safe.
  return new Response(zipBuffer as Uint8Array<ArrayBuffer>, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="data-verification-package-${itemId}.zip"`,
    },
  });
}
