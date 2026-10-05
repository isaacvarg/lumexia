import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useTabActions } from "@/store/tabSlice";

type CanonSubjectRefs = {
  item: { id: string; name: string; referenceCode: string } | null;
  supplier?: { name: string } | null;
  finishedProduct: { name: string; filledWithItem: { id: string; name: string; referenceCode: string } } | null;
};

// the item page that holds an artifact (finished products live on the item they're filled with)
export const canonItemOf = (artifact: CanonSubjectRefs) => artifact.item ?? artifact.finishedProduct?.filledWithItem ?? null;

export const canonSubjectLabel = (artifact: CanonSubjectRefs) =>
  [artifact.finishedProduct?.name ?? artifact.item?.name, artifact.supplier?.name].filter(Boolean).join(" · ");

// Opens an item's details on the Canon tab.
const useOpenItemCanon = () => {
  const router = useRouter();
  const { setActiveTab } = useTabActions();

  return useCallback((item: { id: string; referenceCode: string } | null) => {
    if (!item) return;
    setActiveTab("itemDetails", "canon");
    router.push(`/inventory/items/${item.referenceCode}?id=${item.id}`);
  }, [router, setActiveTab]);
};

export default useOpenItemCanon;
