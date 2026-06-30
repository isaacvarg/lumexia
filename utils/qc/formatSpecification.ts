import { formatParameterValue } from "./formatParameterValue"

type SpecificationLike = {
  specificationType: string
  valueA: string
  valueB?: string | null
}

export const formatSpecification = (
  spec: SpecificationLike | undefined,
  dataTypeId?: string,
): string => {
  if (!spec) return "Not Specified"
  const { specificationType, valueA, valueB } = spec
  switch (specificationType) {
    case "range":
      return `${valueA} – ${valueB ?? ""}`
    case "max":
      return `≤ ${valueA}`
    case "min":
      return `≥ ${valueA}`
    default:
      // a single-value spec on a boolean parameter reads as a Pass/Fail criterion
      return dataTypeId ? formatParameterValue(valueA, dataTypeId) : valueA
  }
}
