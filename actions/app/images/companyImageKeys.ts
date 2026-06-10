// Company config keys that store the fileId of an admin-uploaded image used in
// PDF generation. These are kept OUT of `companyFieldKeys` so the Company Info
// form's save (updateCompanyConfigs) never overwrites them.
export const companyImageKeys = {
  logo: 'logoFileId',
  microFormTemplate: 'microFormTemplateFileId',
  signature: 'signatureFileId',
} as const

export type CompanyImageKey = keyof typeof companyImageKeys
