export const data = {
  modelName: 'itemTypeConfig',
  staticRecordName: null,
  staticRecordKeyName: null,
  generateStaticRecord: false,
  dependency: true,
  dependencyIterator: 'itemTypes',
  seed: (itemType: any) => {
    return [
      {
        isPricingExaminationTriggerEnabled: false,
        itemTypeId: itemType.id,
      }
    ]
  },
};

