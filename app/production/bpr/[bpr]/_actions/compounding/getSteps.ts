'use server'

import prisma from "@/lib/prisma"

export const getSteps = async (bprId: string) => {
  const steps = await prisma.bprBatchStep.findMany({
    where: {
      bprId,
    },
    orderBy: {
      batchStep: {
        sequence: 'asc'
      }
    },
    include: {
      status: true,
      bprStepActionables: {
        include: {
          stepActionable: {
            include: {
              actionableType: true
            }
          }
        }
      },
      batchStep: {
        include: {
          StepAddendum: {
            include: {
              addendumType: true
            }
          },
          StepEquipment: true,
          StepInstruction: true,
          BillOfMaterial: {
            include: {
              item: true
            }
          }
        }
      },
    }
  });

  const bprBomLines = await prisma.bprBillOfMaterials.findMany({
    where: { bprId },
    include: {
      bom: { include: { item: true } },
      addedByUser: true,
      status: true,
    },
  });

  const bomLinesByStepId = bprBomLines.reduce<Record<string, typeof bprBomLines>>((acc, line) => {
    const stepId = line.bom.stepId;
    if (!acc[stepId]) acc[stepId] = [];
    acc[stepId].push(line);
    return acc;
  }, {});

  return steps.map(step => ({
    ...step,
    bprBomLines: bomLinesByStepId[step.batchStep.id] ?? [],
  }));
}

export type ProductionStep = Awaited<ReturnType<typeof getSteps>>[number];
