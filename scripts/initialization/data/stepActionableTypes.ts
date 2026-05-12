export const data = {
  modelName: 'stepActionableType',
  staticRecordName: null,
  staticRecordKeyName: null,
  dependency: true,
  dependencies: ['userRoles'],
  seed: (dependencies: any) => {
    const { userRoles } = dependencies;
    return [
      {
        name: 'Complete Step',
        description: 'Utilize all step materials and appropriate equipment. Ensure that all step instructions and addendums are followed.',
        dataType: 'boolean',
        userRoleId: userRoles.production,
        bgColor: '#333333',
        textColor: '#ffffff',
        config: null,
      },
      {
        name: 'Boolean Check',
        description: 'A generic boolean sign-off. The operator marks the actionable as done.',
        dataType: 'boolean',
        userRoleId: userRoles.production,
        bgColor: '#1f6feb',
        textColor: '#ffffff',
        config: null,
      },
      {
        name: 'Numeric Entry',
        description: 'A numeric reading captured during the step (e.g., pH, temperature, weight).',
        dataType: 'numeric',
        userRoleId: userRoles.production,
        bgColor: '#0e7c66',
        textColor: '#ffffff',
        config: { min: null, max: null, unit: null, decimals: 2 },
      },
      {
        name: 'Photo Evidence',
        description: 'A photo or image attached as evidence that the actionable was performed.',
        dataType: 'photo',
        userRoleId: userRoles.production,
        bgColor: '#8e44ad',
        textColor: '#ffffff',
        config: { maxFiles: 5, accept: 'image/*' },
      },
      {
        name: 'Text Note',
        description: 'A short free-text note recorded during the step.',
        dataType: 'text',
        userRoleId: userRoles.production,
        bgColor: '#d97706',
        textColor: '#ffffff',
        config: { maxLength: 500, placeholder: null },
      },
    ]
  },
};
