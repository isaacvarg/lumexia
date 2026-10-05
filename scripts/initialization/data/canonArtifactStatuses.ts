export const data = {
  modelName: 'canonArtifactStatus',
  staticRecordName: null,
  staticRecordKeyName: null,
  seed: [
    {
      "name": "Pending",
      "description": "Created but has no accepted version yet.",
      "sequence": 0,
      "bgColor": "#F8EAEC",
      "textColor": "#333333"
    },
    {
      "name": "Current",
      "description": "Accepted and up to date.",
      "sequence": 1,
      "bgColor": "#E3E9DD",
      "textColor": "#333333"
    },
    {
      "name": "Stale",
      "description": "An upstream artifact changed; needs confirmation or a change request.",
      "sequence": 2,
      "bgColor": "#FFD7BA",
      "textColor": "#333333"
    },
    {
      "name": "Unreviewed Change",
      "description": "The linked Lumexia source changed and has not been accepted.",
      "sequence": 3,
      "bgColor": "#FFE5A0",
      "textColor": "#333333"
    },
    {
      "name": "Expired",
      "description": "The evidence is past its re-verification date.",
      "sequence": 4,
      "bgColor": "#FEC5BB",
      "textColor": "#333333"
    },
    {
      "name": "Conflict",
      "description": "Upstream values disagree and need a reviewer's decision.",
      "sequence": 5,
      "bgColor": "#F4ACB7",
      "textColor": "#333333"
    },
  ],
};
