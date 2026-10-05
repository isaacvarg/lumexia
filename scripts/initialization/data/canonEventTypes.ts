export const data = {
  modelName: 'canonEventType',
  staticRecordName: null,
  staticRecordKeyName: null,
  seed: [
    {
      "name": "Change Request Opened"
    },
    {
      "name": "Change Request Approved"
    },
    {
      "name": "Change Request Rejected"
    },
    {
      "name": "Change Request Withdrawn"
    },
    {
      "name": "Change Request Outdated",
      "description": "The artifact changed before the CR was resolved."
    },
    {
      "name": "Version Created"
    },
    {
      "name": "Marked Stale",
      "description": "An upstream artifact got a new version."
    },
    {
      "name": "Source Changed",
      "description": "A linked type's source changed and awaits review."
    },
    {
      "name": "Reverification Expired"
    },
    {
      "name": "Conflict Raised",
      "description": "Upstream values disagree, e.g. two suppliers state different INCIs."
    },
    {
      "name": "Conflict Resolved"
    },
  ],
};
