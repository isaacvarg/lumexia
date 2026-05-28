// Group a variant's materials by phase, preserving the original sequence
// order within each group. Phase order is determined by the minimum
// sequence value of any material in that phase. The Unphased bucket
// (key === null) sorts last when phased materials exist; otherwise it
// stands alone.

type WithPhaseAndSequence = {
  phase?: string | null;
  sequence: number;
};

export const groupVariantMaterialsByPhase = <T extends WithPhaseAndSequence>(
  materials: T[],
) => {
  const groups = new Map<string | null, T[]>();
  for (const m of materials) {
    const key = m.phase && m.phase.trim() ? m.phase : null;
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }
  Array.from(groups.values()).forEach((list) => {
    list.sort((a, b) => a.sequence - b.sequence);
  });
  const phasedKeys: string[] = [];
  let hasUnphased = false;
  Array.from(groups.keys()).forEach((key) => {
    if (key === null) hasUnphased = true;
    else phasedKeys.push(key);
  });
  phasedKeys.sort((a, b) => {
    const aMin = groups.get(a)![0].sequence;
    const bMin = groups.get(b)![0].sequence;
    return aMin - bMin;
  });
  const orderedKeys: (string | null)[] = [...phasedKeys];
  if (hasUnphased) orderedKeys.push(null);
  return { groups, orderedKeys };
};
