// Flavor-text pools for the production layers (MBPRs + BPRs), in the Portals & Paws
// voice. Consumed with `pick()`.

// MbprNoteType has no static record, so the mbprs layer seeds these.
export interface MbprNoteTypeData {
  key: string;
  name: string;
  description: string;
  bgColor: string;
  textColor: string;
}

export const MBPR_NOTE_TYPES: ReadonlyArray<MbprNoteTypeData> = [
  { key: 'general', name: 'General', description: 'General note on the master recipe.', bgColor: '#e5e7eb', textColor: '#333333' },
  { key: 'revision', name: 'Revision', description: 'A change to the recipe between versions.', bgColor: '#1e3a5f', textColor: '#dbeafe' },
  { key: 'qaHold', name: 'QA Hold', description: 'Quality flagged something to resolve before the next batch.', bgColor: '#5c1a1a', textColor: '#fee2e2' },
];

export const MBPR_NOTES: ReadonlyArray<string> = [
  'Bumped the vanilla a touch this version — the regulars said the last batch was shy.',
  'Bramble insists the Underdark flour needs the longer proof. She is right, as always.',
  'Holding the chili ratio here. Any higher and we get complaints from the celestial table.',
  'Penelope re-timed the steep; three minutes flat is the sweet spot.',
  'Switched the finishing salt to flaky only. The fine salt vanished into the caramel.',
  'QA wants photo evidence on the bake step until the new oven settles in.',
];

export const BPR_NOTES: ReadonlyArray<string> = [
  'Kettle ran a little hot at the start; pulled it back and the batch is fine.',
  'Short a half-pound of honey crystals — flagged purchasing, subbed from the open lot.',
  'Modron Whiskers supervised the whole compound. Approved, apparently.',
  'Second verifier was on a cat-cuddle break; caught up at the next step.',
  'Beautiful batch. Crema shimmered exactly like it should.',
  'Held for QC overnight — paperwork is with Kallista.',
  'Staging took longer than usual; the astral salmon distracted everyone.',
];

// reasons attached to BprStatusTransition rows when a batch moves backward / sideways
export const BPR_TRANSITION_REASONS: ReadonlyArray<string> = [
  'Materials confirmed on the floor — advancing.',
  'Verifier signed off; moving forward.',
  'Consumption reconciled against the lots.',
  'Held briefly for a material recount.',
  'Corrective action opened after a staging mismatch.',
  'QC released the batch.',
];
