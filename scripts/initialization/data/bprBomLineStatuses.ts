export const data = {
  modelName: 'bprBomLineStatus',
  staticRecordName: null,
  staticRecordKeyName: null,
  seed: [
    {
      "name": "Pending",
      "description": "Initial state before any staging has been pulled.",
      "sequence": 0
    },
    {
      "name": "Staged",
      "description": "All required quantity has been staged.",
      "sequence": 1
    },
    {
      "name": "Primary Verified",
      "description": "Stagings have all passed primary verification.",
      "sequence": 2
    },
    {
      "name": "Secondary Verified",
      "description": "Stagings have all passed secondary verification.",
      "sequence": 3
    },
    {
      "name": "Consumed",
      "description": "Stagings have been consumed by the batch.",
      "sequence": 4
    }
  ],
};
