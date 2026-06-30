import { qcDataTypes } from "@/configs/staticRecords/qcDataTypes"

// Boolean QC results/specs are stored as the strings "true"/"false"; surface them
// as "Pass"/"Fail" in the UI rather than the raw boolean text.
export const formatParameterValue = (
  value: string | null | undefined,
  dataTypeId: string,
): string => {
  if (value === null || value === undefined || value === "") return value ?? ""
  if (dataTypeId === qcDataTypes.boolean) {
    if (value === "true") return "Pass"
    if (value === "false") return "Fail"
  }
  return value
}

// Whether a parameter's values should be rendered as Pass/Fail (and so carry no UoM).
export const isBooleanDataType = (dataTypeId: string): boolean =>
  dataTypeId === qcDataTypes.boolean
