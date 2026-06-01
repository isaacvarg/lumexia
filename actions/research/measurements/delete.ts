"use server";

import prisma from "@/lib/prisma";

export const deleteSampleMeasurement = async (measurementId: string) => {
  return prisma.$transaction(async (tx) => {
    await tx.experimentSampleMeasurementInput.deleteMany({
      where: { measurementId },
    });
    return tx.experimentSampleMeasurement.delete({
      where: { id: measurementId },
    });
  });
};
