"use server";

import prisma from "@/lib/prisma";

type UpdateExperimentInput = {
  id: string;
  objective?: string | null;
  hypothesis?: string | null;
  statusId?: string;
  experimentGroupId?: string | null;
};

export const updateExperiment = async (input: UpdateExperimentInput) => {
  const { id, ...rest } = input;

  const data: Record<string, unknown> = {};

  if (rest.objective !== undefined) {
    data.objective = rest.objective?.trim() ? rest.objective : null;
  }
  if (rest.hypothesis !== undefined) {
    data.hypothesis = rest.hypothesis?.trim() ? rest.hypothesis : null;
  }
  if (rest.statusId !== undefined) {
    data.statusId = rest.statusId;
  }
  if (rest.experimentGroupId !== undefined) {
    data.experimentGroupId = rest.experimentGroupId || null;
  }

  const experiment = await prisma.experiment.update({
    where: { id },
    data,
    include: {
      status: true,
      primaryInvestigator: true,
      primarySubject: true,
      experimentGroup: { include: { status: true } },
    },
  });

  return experiment;
};
