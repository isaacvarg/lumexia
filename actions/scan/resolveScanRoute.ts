"use server";

import prisma from "@/lib/prisma";
import { parseScanPayload, SCAN_TYPES } from "@/lib/scan/scanPayload";

// Resolves a raw scanned QR/barcode string into the route the user should be sent to.
// Returns null when nothing usable can be resolved.
export const resolveScanRoute = async (raw: string): Promise<string | null> => {
  const { type, id } = parseScanPayload(raw);

  if (type === SCAN_TYPES.sample) {
    const sample = await prisma.experimentSample.findUnique({
      where: { id },
      include: { experiment: true },
    });

    if (sample?.experiment) {
      return `/research/experiments/${sample.experiment.referenceCode}?id=${sample.experiment.id}&sampleId=${sample.id}`;
    }
    // Unknown sample id — fall through to the lot/audit default below.
  }

  // lot (and default/legacy bare UUID) → inventory audit detail.
  return `/inventory/audit/${id}`;
};
