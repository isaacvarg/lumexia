import { bprStatuses } from "@/configs/staticRecords/bprStatuses";

export type BprStatusKey = keyof typeof bprStatuses;

export type BprEvent =
  | 'bprQueued'
  | 'stagingStarted'
  | 'stagingCompleted'
  | 'compoundingFinished'
  | 'completionCascadeSucceeded'
  | 'completionCascadeFailed';

interface Transition {
  to: BprStatusKey;
  from: BprStatusKey[];
}

export const transitionMap: Record<BprEvent, Transition> = {
  bprQueued:                  { to: 'queued',            from: ['draft'] },
  stagingStarted:             { to: 'stagingMaterials',  from: ['queued'] },
  stagingCompleted:           { to: 'compounding',       from: ['stagingMaterials'] },
  compoundingFinished:        { to: 'completed',         from: ['compounding'] },
  completionCascadeSucceeded: { to: 'awaitingQc',        from: ['completed'] },
  completionCascadeFailed:    { to: 'consumptionError',  from: ['completed', 'awaitingQc'] },
};
