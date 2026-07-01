import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";

export type ViewStatuses = {
  isStaging: boolean;
  isPrimaryVerifcation: boolean;
  isSecondaryVerification: boolean;
  isCompounding: boolean;
};

export type OverviewStage = 'staging' | 'primary' | 'secondary' | 'compounding';

// Order of BOM line statuses, used to decide whether a line has reached a stage.
export const BOM_STATUS_ORDER: string[] = [
  bprBomLineStatuses.pending,
  bprBomLineStatuses.staged,
  bprBomLineStatuses.primaryVerified,
  bprBomLineStatuses.secondaryVerified,
  bprBomLineStatuses.consumed,
];

export const bomLineReached = (statusId: string, target: string) =>
  BOM_STATUS_ORDER.indexOf(statusId) >= BOM_STATUS_ORDER.indexOf(target);

// Derive the lifecycle stage booleans purely from BOM line statuses.
export const deriveViewStatuses = (bomLineStatusIds: string[]): ViewStatuses => {
  const { pending, staged, primaryVerified } = bprBomLineStatuses;

  const isStaging = bomLineStatusIds.some(id => id === pending);
  const isPrimaryVerifcation = bomLineStatusIds.some(id => id === staged);
  const isSecondaryVerification = bomLineStatusIds.some(id => id === primaryVerified);
  const isCompounding = !isStaging && !isPrimaryVerifcation && !isSecondaryVerification;

  return { isStaging, isPrimaryVerifcation, isSecondaryVerification, isCompounding };
};

// The active/blocking stage in lifecycle order — the earliest stage that
// still has outstanding work is what the batch record is waiting on.
export const getActiveStage = (viewStatuses: ViewStatuses): OverviewStage => {
  if (viewStatuses.isStaging) return 'staging';
  if (viewStatuses.isPrimaryVerifcation) return 'primary';
  if (viewStatuses.isSecondaryVerification) return 'secondary';
  return 'compounding';
};

// Plain-text team labels for use where the i18n `translations` map isn't available.
export const STAGE_TEAM_LABEL: Record<OverviewStage, string> = {
  staging: 'Production Team',
  primary: 'Quality — Primary Verification',
  secondary: 'Quality — Secondary Verification',
  compounding: 'Production Team',
};
