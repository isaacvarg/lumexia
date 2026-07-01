'use server'

import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export const createUomConversion = async (data: Prisma.UnitOfMeasurementConversionUncheckedCreateInput) => {
  const res = await prisma.unitOfMeasurementConversion.create({ data, });

  return res;
}
