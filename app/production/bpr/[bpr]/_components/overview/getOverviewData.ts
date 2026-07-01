import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";
import { BprBomItem } from "../../_actions/getBprBom";
import { ProductionStep } from "../../_actions/compounding/getSteps";
import { translations } from "../../_configs/translations";

type ViewStatuses = {
  isStaging: boolean;
  isPrimaryVerifcation: boolean;
  isSecondaryVerification: boolean;
  isCompounding: boolean;
};

export type OverviewStage = 'staging' | 'primary' | 'secondary' | 'compounding';

export type OverviewItemState = 'done' | 'current' | 'pending';

export type OverviewItem = {
  id: string;
  sequence: number;
  label: string;
  state: OverviewItemState;
};

export type OverviewData = {
  stage: OverviewStage;
  // translation keys resolved by the component via t(translations, key)
  teamKey: keyof typeof translations;
  progressLabelKey: keyof typeof translations;
  completed: number;
  total: number;
  items: OverviewItem[];
};

// The active/blocking stage in lifecycle order — the earliest stage that
// still has outstanding work is what the batch record is waiting on.
export const getActiveStage = (viewStatuses: ViewStatuses): OverviewStage => {
  if (viewStatuses.isStaging) return 'staging';
  if (viewStatuses.isPrimaryVerifcation) return 'primary';
  if (viewStatuses.isSecondaryVerification) return 'secondary';
  return 'compounding';
};

const STAGE_META: Record<OverviewStage, { teamKey: keyof typeof translations; progressLabelKey: keyof typeof translations }> = {
  staging: { teamKey: 'overviewTeamProduction', progressLabelKey: 'overviewProgressStaging' },
  primary: { teamKey: 'overviewTeamPrimaryQuality', progressLabelKey: 'overviewProgressPrimary' },
  secondary: { teamKey: 'overviewTeamSecondaryQuality', progressLabelKey: 'overviewProgressSecondary' },
  compounding: { teamKey: 'overviewTeamProduction', progressLabelKey: 'overviewProgressCompounding' },
};

// Order of BOM line statuses, used to decide whether a line has reached a stage.
const BOM_STATUS_ORDER: string[] = [
  bprBomLineStatuses.pending,
  bprBomLineStatuses.staged,
  bprBomLineStatuses.primaryVerified,
  bprBomLineStatuses.secondaryVerified,
  bprBomLineStatuses.consumed,
];

const bomLineReached = (statusId: string, target: string) =>
  BOM_STATUS_ORDER.indexOf(statusId) >= BOM_STATUS_ORDER.indexOf(target);

const bomItems = (bom: BprBomItem[], target: string): OverviewItem[] =>
  bom
    .slice()
    .sort((a, b) => a.bom.item.name.localeCompare(b.bom.item.name))
    .map((line, index) => ({
      id: line.id,
      sequence: index + 1,
      label: line.bom.item.name,
      state: bomLineReached(line.statusId, target) ? 'done' : 'pending',
    }));

export const getOverviewData = (
  stage: OverviewStage,
  steps: ProductionStep[],
  bom: BprBomItem[],
): OverviewData => {
  const meta = STAGE_META[stage];

  if (stage === 'compounding') {
    const ordered = steps
      .slice()
      .sort((a, b) => a.batchStep.sequence - b.batchStep.sequence);
    const firstIncompleteId = ordered.find((s) => !s.isComplete)?.id;
    const items: OverviewItem[] = ordered.map((step) => ({
      id: step.id,
      sequence: step.batchStep.sequence,
      label: step.batchStep.label ?? '',
      state: step.isComplete ? 'done' : step.id === firstIncompleteId ? 'current' : 'pending',
    }));
    return {
      stage,
      teamKey: meta.teamKey,
      progressLabelKey: meta.progressLabelKey,
      completed: items.filter((i) => i.state === 'done').length,
      total: items.length,
      items,
    };
  }

  const target =
    stage === 'staging'
      ? bprBomLineStatuses.staged
      : stage === 'primary'
        ? bprBomLineStatuses.primaryVerified
        : bprBomLineStatuses.secondaryVerified;

  const items = bomItems(bom, target);
  return {
    stage,
    teamKey: meta.teamKey,
    progressLabelKey: meta.progressLabelKey,
    completed: items.filter((i) => i.state === 'done').length,
    total: items.length,
    items,
  };
};
