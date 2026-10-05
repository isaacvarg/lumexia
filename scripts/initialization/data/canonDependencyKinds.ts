export const data = {
  modelName: 'canonDependencyKind',
  staticRecordName: null,
  staticRecordKeyName: null,
  seed: [
    {
      "name": "Same Subject",
      "description": "Parent and child artifacts belong to the same item or finished product."
    },
    {
      "name": "Active Bom",
      "description": "The child depends on the parent artifact of every material in its active MBPR BOM."
    },
    {
      "name": "Suppliers",
      "description": "The child item depends on every item + supplier artifact for that item."
    },
    {
      "name": "Filled Item",
      "description": "A finished product depends on the artifact of the item it is filled with."
    },
  ],
};
