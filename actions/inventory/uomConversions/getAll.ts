"use server"

import prisma from "@/lib/prisma"

export const getAllUomConversions = async () => {
  const conversions = await prisma.unitOfMeasurementConversion.findMany({
    include: { uomA: true, uomB: true },
    orderBy: { uomA: { name: 'asc' } },
  });

  return conversions;
}

export type UomConversion = Awaited<ReturnType<typeof getAllUomConversions>>[number];
