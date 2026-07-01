"use server"

import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export const updateUomConversion = async (id: string, data: Prisma.UnitOfMeasurementConversionUncheckedUpdateInput) => {

  const res = await prisma.unitOfMeasurementConversion.update({
    where: { id, },
    data,
  });

  return res;
}
