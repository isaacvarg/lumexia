import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";
import { bprStatuses } from "@/configs/staticRecords/bprStatuses";
import prisma from "@/lib/prisma";
import { groupByProperty } from "@/utils/data/groupByProperty";
import { bomLineReached, deriveViewStatuses, getActiveStage, OverviewStage, STAGE_TEAM_LABEL } from "./activeStage";

export type BprOverview = {
  stage: OverviewStage;
  teamLabel: string;
  completed: number;
  total: number;
};

// Statuses where a batch is actively progressing through the material lifecycle,
// so a "waiting on" team + progress is meaningful. Draft/queued/completed/QC/error
// statuses are intentionally excluded.
const IN_FLIGHT_STATUSES: string[] = [
  bprStatuses.stagingMaterials,
  bprStatuses.awaitingMaterials,
  bprStatuses.allocatingMaterials,
  bprStatuses.knownMaterialArrival,
  bprStatuses.verifyingBomFulfillment,
  bprStatuses.compounding,
];

// The BOM line status that marks a line as having reached each (non-compounding) stage.
const STAGE_TARGET: Record<Exclude<OverviewStage, 'compounding'>, string> = {
  staging: bprBomLineStatuses.staged,
  primary: bprBomLineStatuses.primaryVerified,
  secondary: bprBomLineStatuses.secondaryVerified,
};

const buildOverview = (
  statusId: string,
  bomLineStatusIds: string[],
  steps: { isComplete: boolean }[],
): BprOverview | null => {
  if (!IN_FLIGHT_STATUSES.includes(statusId)) return null;
  if (bomLineStatusIds.length === 0) return null;

  const stage = getActiveStage(deriveViewStatuses(bomLineStatusIds));

  if (stage === 'compounding') {
    return {
      stage,
      teamLabel: STAGE_TEAM_LABEL[stage],
      completed: steps.filter(s => s.isComplete).length,
      total: steps.length,
    };
  }

  const target = STAGE_TARGET[stage];
  return {
    stage,
    teamLabel: STAGE_TEAM_LABEL[stage],
    completed: bomLineStatusIds.filter(id => bomLineReached(id, target)).length,
    total: bomLineStatusIds.length,
  };
};

// Batch-computes the "waiting on" overview for many BPRs at once. BOM lines have no
// back-relation on the BPR model, so they (and step completions) are fetched in two
// batch queries keyed by bprId rather than N+1 per record.
export const getBprOverviews = async (
  bprs: { id: string; bprStatusId: string }[],
): Promise<Record<string, BprOverview | null>> => {
  const ids = bprs.map(b => b.id);

  const [bomLines, steps] = await Promise.all([
    prisma.bprBillOfMaterials.findMany({
      where: { bprId: { in: ids } },
      select: { bprId: true, statusId: true },
    }),
    prisma.bprBatchStep.findMany({
      where: { bprId: { in: ids } },
      select: { bprId: true, isComplete: true },
    }),
  ]);

  const bomByBpr = groupByProperty(bomLines, "bprId");
  const stepsByBpr = groupByProperty(steps, "bprId");

  return Object.fromEntries(
    bprs.map(bpr => [
      bpr.id,
      buildOverview(
        bpr.bprStatusId,
        (bomByBpr[bpr.id] ?? []).map(l => l.statusId),
        stepsByBpr[bpr.id] ?? [],
      ),
    ]),
  );
};
