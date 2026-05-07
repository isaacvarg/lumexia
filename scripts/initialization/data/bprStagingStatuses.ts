export const data = {
  modelName: 'bprStagingStatus',
  staticRecordName: null,
  staticRecordKeyName: null,
  seed: [
    {
      "name": "Denied",
      "description": "Reverted or denied during verification.",
      "sequence": 0
    },
    {
      "name": "Staged",
      "description": "Item has been staged/pulled.",
      "sequence": 1
    },
    {
      "name": "Primary Verified",
      "description": "Someone else has checked that this material has been pulled properly.",
      "sequence": 2
    },
    {
      "name": "Secondary Verified",
      "description": "An additional person has verified that this material was pulled properly.",
      "sequence": 3
    },
    {
      "name": "Consumed",
      "description": "These materials have been consumed by this BPR.",
      "sequence": 4
    }
  ],
};
