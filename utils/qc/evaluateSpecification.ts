export type SpecEvaluation = 'pass' | 'fail' | 'unknown'

type SpecLike = {
  specificationType: string
  valueA: string
  valueB?: string | null
}

export const evaluateSpecification = (value: string, spec: SpecLike): SpecEvaluation => {
  const n = Number(value)
  const a = Number(spec.valueA)
  const b = spec.valueB == null ? null : Number(spec.valueB)

  if (Number.isNaN(n)) {
    if (spec.specificationType === 'single') {
      return value.trim() === spec.valueA.trim() ? 'pass' : 'fail'
    }
    return 'unknown'
  }

  switch (spec.specificationType) {
    case 'range':
      if (b === null || Number.isNaN(a) || Number.isNaN(b)) return 'unknown'
      return n >= a && n <= b ? 'pass' : 'fail'
    case 'max':
      if (Number.isNaN(a)) return 'unknown'
      return n <= a ? 'pass' : 'fail'
    case 'min':
      if (Number.isNaN(a)) return 'unknown'
      return n >= a ? 'pass' : 'fail'
    case 'single':
      return value.trim() === spec.valueA.trim() ? 'pass' : 'fail'
    default:
      return 'unknown'
  }
}

type SpecWithInputs<S> = S & {
  itemSpecificationInputs: { parameterInputDefinitionId: string; value: string }[]
}

type RunLike = {
  parameterInputResults: { parameterInputDefinitionId: string; value: string }[]
}

/**
 * Find the spec whose pinned input conditions exactly match the run's input results.
 * A spec with zero pinned inputs is considered an "unconditional" match (lowest priority).
 */
export const findMatchingSpec = <S extends SpecLike>(
  specs: SpecWithInputs<S>[],
  run: RunLike,
): SpecWithInputs<S> | undefined => {
  const exact = specs.find(s =>
    s.itemSpecificationInputs.length > 0 &&
    s.itemSpecificationInputs.every(si => {
      const runInput = run.parameterInputResults.find(r => r.parameterInputDefinitionId === si.parameterInputDefinitionId)
      return runInput?.value === si.value
    })
  )
  if (exact) return exact
  return specs.find(s => s.itemSpecificationInputs.length === 0)
}
