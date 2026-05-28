export const data = {
  modelName: 'experimentGroupStatus',
  staticRecordName: null,
  staticRecordKeyName: null,
  seed: [
    {
      "name": "Active",
      "description": "Group contains experiments that are currently in progress or being planned.",
      "sequence": 0,
      "bgColor": "#D8E2DC",
      "textColor": "#333333"
    },
    {
      "name": "Completed",
      "description": "All experiments in the group have been completed.",
      "sequence": 1,
      "bgColor": "#E3E9DD",
      "textColor": "#333333"
    },
    {
      "name": "Archived",
      "description": "Group is closed and kept for historical reference.",
      "sequence": 2,
      "bgColor": "#C8C7D6",
      "textColor": "#333333"
    },
  ],
};
