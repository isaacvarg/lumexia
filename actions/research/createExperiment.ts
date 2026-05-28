"use server";

import prisma from "@/lib/prisma";
import { experimentStatuses } from "@/configs/staticRecords/experimentStatuses";
import { getUserId } from "@/actions/users/getUserId";

type CreateExperimentInput = {
  primarySubjectId: string;
  objective?: string | null;
  hypothesis?: string | null;
  experimentGroupId?: string | null;
};

export const createExperiment = async (input: CreateExperimentInput) => {
  const primaryInvestigatorId = await getUserId();

  const experiment = await prisma.experiment.create({
    data: {
      objective: input.objective || null,
      hypothesis: input.hypothesis || null,
      primarySubjectId: input.primarySubjectId,
      experimentGroupId: input.experimentGroupId || null,
      statusId: experimentStatuses.planning,
      primaryInvestigatorId,
    },
    include: {
      status: true,
      primaryInvestigator: true,
      primarySubject: true,
      experimentGroup: true,
    },
  });

  return experiment;
};
