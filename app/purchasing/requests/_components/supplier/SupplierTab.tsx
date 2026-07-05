import { usePurchasingRequestActions, usePurchasingRequestSelection } from "@/store/purchasingRequestSlice"
import SupplierButton from "./SupplierButton"
import { useMemo, useState } from "react"
import RequestCard from "../shared/RequestCard"
import SupplierGroup from "./SupplierGroup"
import SearcherUnmanaged from "@/components/Search/SearcherUnmanaged"
import { RequestForDashboard } from "../../_functions/getRequests"

const SupplierTab = () => {

  const { requests, suppliersGrouped, selectedSupplierId, options } = usePurchasingRequestSelection()
  const { setSelectedSupplierId } = usePurchasingRequestActions();
  const [searchInput, setSearchInput] = useState<string>('')
  const [searchResults, setSearchResults] = useState<RequestForDashboard[]>([])


  const filteredRequests = useMemo(() => {
    if (!selectedSupplierId) {
      return requests
    }

    return suppliersGrouped.get(selectedSupplierId) || [];
  },
    [suppliersGrouped, selectedSupplierId, requests]
  );

  const displayRequests = useMemo(() => {
    const source = searchInput.trim() ? searchResults : filteredRequests;
    if (selectedSupplierId) {
      return source;
    }

    const grouped = new Map<string, RequestForDashboard[]>();
    source.forEach(r => {
      if (r.suppliers && r.suppliers.length > 0) {
        r.suppliers.forEach(s => {
          if (!grouped.has(s.id)) {
            grouped.set(s.id, []);
          }
          grouped.get(s.id)?.push(r);
        });
      } else {
        if (!grouped.has('untagged')) {
          grouped.set('untagged', []);
        }
        grouped.get('untagged')?.push(r);
      }
    });
    return grouped;
  }, [filteredRequests, searchResults, searchInput, selectedSupplierId])


  const sortedSupplierIds = useMemo(() => {
    const source = (displayRequests instanceof Map) ? displayRequests : suppliersGrouped
    return Array.from(source.keys()).sort((a, b) => {
      if (a === 'untagged') return -1;
      if (b === 'untagged') return 1;

      const groupA = source.get(a);
      const supplierA = groupA?.[0]?.suppliers.find(s => s.id === a);
      const nameA = supplierA?.name || '';

      const groupB = source.get(b);
      const supplierB = groupB?.[0]?.suppliers.find(s => s.id === b);
      const nameB = supplierB?.name || '';

      return nameA.localeCompare(nameB);
    });
  }, [suppliersGrouped, displayRequests]);

  return (
    <div className="flex flex-col gap-6">
      <SearcherUnmanaged
        data={filteredRequests}
        keys={['requestedItemName', 'suppliers.name']}
        input={searchInput}
        setInput={setSearchInput}
        onQueryComplete={setSearchResults}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          className={`btn-lg btn ${!selectedSupplierId ? 'btn-secondary' : 'btn-soft'} flex w-full  justify-between`}
          onClick={() => setSelectedSupplierId(null)}
        >
          <span>All</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-info text-xs font-semibold text-info-content">
            {requests.length}
          </div>
        </button>
        {sortedSupplierIds.map((supplierId) => <SupplierButton key={supplierId} supplierId={supplierId} />)}

      </div>

      {selectedSupplierId && Array.isArray(displayRequests) && displayRequests.length !== 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRequests.map(r => <RequestCard key={r.id} request={r} />)}
        </div>
      )}

      {!selectedSupplierId && (displayRequests instanceof Map) && (
        <div className="flex flex-col gap-4">
          {sortedSupplierIds.map(supplierId => {
            const selection = displayRequests.get(supplierId) || [];
            const supplierName = supplierId === 'untagged' ? 'Untagged' : options.suppliers.get(supplierId) || '';
            if (selection.length === 0) return
            return (
              <SupplierGroup key={supplierId} requests={selection} supplierName={supplierName} />
            )
          })}
        </div>
      )}


    </div>
  )
}

export default SupplierTab
