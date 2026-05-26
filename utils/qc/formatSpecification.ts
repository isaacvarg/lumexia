type SpecificationLike = {
  specificationType: string
  valueA: string
  valueB?: string | null
}

export const formatSpecification = (spec: SpecificationLike | undefined): string => {
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
      return valueA
  }
}
