export type ActionableDataType = 'boolean' | 'numeric' | 'photo' | 'text'

export const actionableDataTypes: ActionableDataType[] = ['boolean', 'numeric', 'photo', 'text']

export type ActionableTypeConfig =
  | null
  | { min: number | null; max: number | null; unit: string | null; decimals: number | null } // numeric
  | { maxFiles: number; accept: string }                                                      // photo
  | { maxLength: number; placeholder: string | null }                                         // text

export interface ActionableType {
  id: string
  name: string
  userRoleId: string
  description: string | null
  dataType: string
  bgColor: string
  textColor: string
  config: ActionableTypeConfig
  createdAt: Date
  updatedAt: Date
}
