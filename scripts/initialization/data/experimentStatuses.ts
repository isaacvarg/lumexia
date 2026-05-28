export const data = {
  modelName: 'experimentStatus',
  staticRecordName: null,
  staticRecordKeyName: null,
  seed: [
    {
      "name": "Planning",
      "description": "Experiment is being designed; variants and protocol are being defined.",
      "sequence": 0,
      "bgColor": "#F8EAEC",
      "textColor": "#333333"
    },
    {
      "name": "Active",
      "description": "Experiment is in progress; samples are being prepared and observations recorded.",
      "sequence": 1,
      "bgColor": "#D8E2DC",
      "textColor": "#333333"
    },
    {
      "name": "On Hold",
      "description": "Experiment is paused pending materials, equipment, or a decision.",
      "sequence": 2,
      "bgColor": "#FFD7BA",
      "textColor": "#333333"
    },
    {
      "name": "Completed",
      "description": "Experiment is finished and results are recorded.",
      "sequence": 3,
      "bgColor": "#E3E9DD",
      "textColor": "#333333"
    },
    {
      "name": "Cancelled",
      "description": "Experiment was abandoned before completion.",
      "sequence": 4,
      "bgColor": "#FEC5BB",
      "textColor": "#333333"
    },
  ],
};
