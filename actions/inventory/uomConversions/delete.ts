'use server'

import prisma from "@/lib/prisma"

export const deleteUomConversion = async (id: string) => {
  const res = await prisma.unitOfMeasurementConversion.delete({
    where: { id, }
  });

  return res;
};
