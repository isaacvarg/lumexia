import { FacetOptions } from "@/types/facetOption";
import { restructureData } from "./restructureData";

// * A specific use of the restructureData utility
// * This is for easily creating facet filter options directly from fetched data

interface Structure {
    key: string; 
    rename: boolean | string 
  }

export const toFacetFilter = (array: any[], value: string, label: string) => {
    const structure : Structure[] = [
      {
        key: value,
        rename: "value"
      },
      {
        key: label,
        rename: "label"
      }
    ];
  
    const data = restructureData(array, structure) as FacetOptions[]

    // Drop options missing a value or label — restructureData omits a key when the
    // source field is null/undefined, which would otherwise crash consumers that
    // read option.label (e.g. FacetFilter).
    return data.filter((option) => option.value != null && option.label != null)
  }