import { canonDependencyKinds } from "@/configs/staticRecords/canonDependencyKinds";
import { canonSubjectTypes } from "@/configs/staticRecords/canonSubjectTypes";

// Client-safe: which subject types each dependency kind connects (parent → child).
// null means any subject, as long as parent and child share it.
export const dependencyKindSubjects: Record<keyof typeof canonDependencyKinds, { parent: string | null; child: string | null }> = {
  sameSubject: { parent: null, child: null },
  activeBom: { parent: canonSubjectTypes.item, child: canonSubjectTypes.item },
  suppliers: { parent: canonSubjectTypes.itemSupplier, child: canonSubjectTypes.item },
  filledItem: { parent: canonSubjectTypes.item, child: canonSubjectTypes.finishedProduct },
};

export const kindKeyById = Object.fromEntries(
  Object.entries(canonDependencyKinds).map(([key, id]) => [id, key]),
) as Record<string, keyof typeof canonDependencyKinds>;

// The dependency kinds that can connect a parent of one subject type to a child of another.
export const validDependencyKinds = (parentSubjectTypeId: string, childSubjectTypeId: string): string[] => {
  return Object.entries(dependencyKindSubjects)
    .filter(([key, s]) =>
      key === "sameSubject"
        ? parentSubjectTypeId === childSubjectTypeId
        : s.parent === parentSubjectTypeId && s.child === childSubjectTypeId,
    )
    .map(([key]) => canonDependencyKinds[key as keyof typeof canonDependencyKinds]);
};
