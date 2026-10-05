export const data = {
  modelName: 'canonChangeRequestStatus',
  staticRecordName: null,
  staticRecordKeyName: null,
  seed: [
    {
      "name": "Under Review",
      "description": "Waiting for reviewer decisions.",
      "sequence": 0,
      "bgColor": "#FFE5A0",
      "textColor": "#333333"
    },
    {
      "name": "Approved",
      "description": "Approved and applied as a new version.",
      "sequence": 1,
      "bgColor": "#E3E9DD",
      "textColor": "#333333"
    },
    {
      "name": "Rejected",
      "description": "Rejected by a reviewer.",
      "sequence": 2,
      "bgColor": "#FEC5BB",
      "textColor": "#333333"
    },
    {
      "name": "Withdrawn",
      "description": "Withdrawn by the requester.",
      "sequence": 3,
      "bgColor": "#D8E2DC",
      "textColor": "#333333"
    },
    {
      "name": "Outdated",
      "description": "The artifact changed before this CR was resolved.",
      "sequence": 4,
      "bgColor": "#F8EAEC",
      "textColor": "#333333"
    },
  ],
};
