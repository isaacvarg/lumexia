// Single source of truth for the company config fields. Keys MUST match exactly
// what consumers read (e.g. the PO / Certificate of Analysis PDF generators) so
// edits flow through to those documents.

export type CompanyField = {
  key: string
  label: string
}

export type CompanyFieldGroup = {
  title: string
  fields: CompanyField[]
}

export const companyFieldGroups: CompanyFieldGroup[] = [
  {
    title: 'Company',
    fields: [
      { key: 'name', label: 'Company Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
    ],
  },
  {
    title: 'Address',
    fields: [
      { key: 'addressStreet1', label: 'Street 1' },
      { key: 'addressStreet2', label: 'Street 2' },
      { key: 'addressCity', label: 'City' },
      { key: 'addressState', label: 'State' },
      { key: 'addressZipcode', label: 'Zip Code' },
    ],
  },
  {
    title: 'Purchasing Contact',
    fields: [
      { key: 'purchasingContactFirstName', label: 'First Name' },
      { key: 'purchasingContactLastName', label: 'Last Name' },
      { key: 'purchasingContactEmail', label: 'Email' },
    ],
  },
]

export const companyFieldKeys = companyFieldGroups.flatMap(group => group.fields.map(field => field.key))
