"use client"
import React, { useEffect, useMemo, useState } from "react";
import { SupplierDetailsItems } from "../../_actions/getItems";
import Card from "@/components/Card";
import ItemRow from "./ItemRow";
import { SupplierFilterItems, getFilteredItems } from "../../_actions/getFilteredItems";
import Text from "@/components/Text";
import SectionTitle from "@/components/Text/SectionTitle";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits";
import { useSupplierDetailSelection } from "@/store/supplierDetailSlice";
import Searcher from "@/components/Search/Searcher";
import DataTable from "@/components/DataTable";
import { TbSortAscending, TbSortDescending } from "react-icons/tb";
import { SortableHeaderType } from "@/components/DataTable/SortableHeaderType";
import Tag from "@/components/Text/Tag";
import { createColumnHelper } from "@tanstack/react-table";
import { DateTime } from "luxon";
import {
  RowSelectionHandlerMethod,
  rowSelectionHandler,
} from "@/utils/auxiliary/rowSelectionHandler";
import { useRouter } from "next/navigation";

const columnHelper = createColumnHelper<any>();

const purchaseColumns = [
  columnHelper.accessor("purchaseOrders.referenceCode", {
    header: SortableHeaderType("PO #"),
  }),
  columnHelper.accessor("purchaseOrders.status.id", {
    id: "status",
    header: SortableHeaderType("Status"),
    cell: (row) => {
      const status = row.row.original.purchaseOrders?.status;
      if (!status) return "—";
      return <Tag label={status.name} bgColor={status.bgColor} textColor={status.textColor} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.accessor((row) => row.purchaseOrders?.poAccountingDetail?.paymentMethod?.id, {
    id: "paymentMethod",
    header: SortableHeaderType("Payment Method"),
    cell: (row) => row.row.original.purchaseOrders?.poAccountingDetail?.paymentMethod?.methodName ?? "—",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.accessor("quantity", {
    header: SortableHeaderType("Quantity"),
  }),
  columnHelper.accessor("pricePerUnit", {
    header: SortableHeaderType("Price / Unit"),
    cell: (row) => toFracitonalDigits.curreny(row.getValue()),
  }),
  columnHelper.accessor("uom.abbreviation", {
    header: SortableHeaderType("UOM"),
  }),
  columnHelper.accessor("createdAt", {
    header: SortableHeaderType("Date"),
    cell: (row) => DateTime.fromJSDate(new Date(row.getValue())).toFormat("DD"),
  }),
];

const chartOptions: ApexOptions = {
  chart: {
    type: "area",
  },
  stroke: { curve: "smooth" },
};

type SortField = "name" | "quantity" | "spend";
type SortDirection = "asc" | "desc";

const ItemsTab = () => {
  const { items, purchases } = useSupplierDetailSelection();
  const router = useRouter();

  // Aggregate totals per item from purchases
  const itemAggregates = useMemo(() => {
    const map = new Map<string, { totalQuantity: number; totalSpend: number }>();
    purchases.forEach((po) => {
      po.lineItems?.forEach((li) => {
        const existing = map.get(li.itemId) || { totalQuantity: 0, totalSpend: 0 };
        existing.totalQuantity += li.quantity;
        existing.totalSpend += li.total;
        map.set(li.itemId, existing);
      });
    });
    return map;
  }, [purchases]);

  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filteredItems, setFilteredItems] = useState<SupplierDetailsItems[]>(items);

  // Re-sync filteredItems when items change
  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    }
  };

  const displayItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.item.name.localeCompare(b.item.name);
          break;
        case "quantity": {
          const aQty = itemAggregates.get(a.itemId)?.totalQuantity ?? 0;
          const bQty = itemAggregates.get(b.itemId)?.totalQuantity ?? 0;
          comparison = aQty - bQty;
          break;
        }
        case "spend": {
          const aSpend = itemAggregates.get(a.itemId)?.totalSpend ?? 0;
          const bSpend = itemAggregates.get(b.itemId)?.totalSpend ?? 0;
          comparison = aSpend - bSpend;
          break;
        }
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [filteredItems, sortField, sortDirection, itemAggregates]);

  const [selectedItem, setSelectedItem] = useState<SupplierDetailsItems | null>(null);

  // Auto-select first item when display changes
  useEffect(() => {
    if (displayItems.length > 0 && (!selectedItem || !displayItems.find(i => i.id === selectedItem.id))) {
      setSelectedItem(displayItems[0]);
    }
  }, [displayItems]);

  const [itemData, setItemData] = useState<SupplierFilterItems | null>(null);
  const [dateRangeMode, setDateRangeMode] = useState<
    "yearToDate" | "lastYear" | "all"
  >("yearToDate");

  useEffect(() => {
    if (!selectedItem) return;

    const fetchData = async () => {
      try {
        const data = await getFilteredItems(
          selectedItem.item.id,
          selectedItem.purchaseOrders.supplierId,
          dateRangeMode
        );
        setItemData(data as any);
      } catch (error) {
        console.error("Error fetching item data:", error);
      }
    };

    fetchData();
  }, [selectedItem, dateRangeMode]);

  const SortIcon = sortDirection === "asc" ? TbSortAscending : TbSortDescending;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Items list - 1/3 */}
        <div className="col-span-1 flex flex-col gap-6">
          <SectionTitle>Items Supplied</SectionTitle>

          <div className="w-full">
            <Searcher
              data={items}
              keys={["item.name"]}
              onQueryComplete={setFilteredItems}
            />
          </div>

          <div className="flex gap-2 w-full">
            <button
              className={`btn btn-sm flex-1 ${sortField === "name" ? "btn-secondary" : "btn-outline"}`}
              onClick={() => handleSortToggle("name")}
            >
              Name
              {sortField === "name" && <SortIcon className="size-4" />}
            </button>
            <button
              className={`btn btn-sm flex-1 ${sortField === "quantity" ? "btn-secondary" : "btn-outline"}`}
              onClick={() => handleSortToggle("quantity")}
            >
              Quantity
              {sortField === "quantity" && <SortIcon className="size-4" />}
            </button>
            <button
              className={`btn btn-sm flex-1 ${sortField === "spend" ? "btn-secondary" : "btn-outline"}`}
              onClick={() => handleSortToggle("spend")}
            >
              Spend
              {sortField === "spend" && <SortIcon className="size-4" />}
            </button>
          </div>

          <Card.Root>
            <div className="flex flex-col gap-y-2 max-h-[500px] overflow-y-auto">
              {displayItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  selectedItemId={selectedItem?.id}
                  onClick={setSelectedItem}
                />
              ))}
            </div>
          </Card.Root>
        </div>

        {/* Item detail - 2/3 */}
        <div className="col-span-1 sm:col-span-2 flex flex-col gap-6">
          {selectedItem ? (
            <>
              <div className="flex justify-between items-center">
                <SectionTitle>{selectedItem.item.name}</SectionTitle>
                <div className="flex gap-2">
                  <button
                    className={`btn ${dateRangeMode === "all" ? "btn-secondary" : "btn-outline"}`}
                    onClick={() => setDateRangeMode("all")}
                  >
                    All
                  </button>
                  <button
                    className={`btn ${dateRangeMode === "yearToDate" ? "btn-secondary" : "btn-outline"}`}
                    onClick={() => setDateRangeMode("yearToDate")}
                  >
                    This Year
                  </button>
                  <button
                    className={`btn ${dateRangeMode === "lastYear" ? "btn-secondary" : "btn-outline"}`}
                    onClick={() => setDateRangeMode("lastYear")}
                  >
                    Last Year
                  </button>
                </div>
              </div>

              {!itemData ? <Skeleton count={5} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card.Root>
                    <Card.Title size="small">Summary</Card.Title>
                    <div className="flex flex-col gap-y-2">
                      <Text.LabelDataPair label="Total Spent" data={toFracitonalDigits.curreny(itemData.totalSpent)} />
                      <Text.LabelDataPair label="Last Price" data={`${toFracitonalDigits.curreny(itemData.lastPaid.price)} $/${itemData.lastPaid.uom.abbreviation}`} />
                      <Text.LabelDataPair label="UOM(s)" data={itemData.uoms.toString()} />
                      <Text.LabelDataPair label="Purchases" data={itemData.purchases.length} />
                    </div>
                  </Card.Root>

                  <div className="col-span-1 sm:col-span-2">
                    <Card.Root>
                      <Card.Title size="small">Trends</Card.Title>
                      <Chart
                        options={chartOptions}
                        series={itemData.pricingChartData}
                        type="area"
                        height={300}
                      />
                    </Card.Root>
                  </div>
                </div>
              )}

              {itemData && itemData.purchases.length > 0 && (
                <Card.Root>
                  <Card.Title size="small">Purchase Orders</Card.Title>
                  <DataTable.Default
                    data={itemData.purchases}
                    columns={purchaseColumns}
                    tableStateName="supplierItemPurchases"
                    onRowClick={(row) => {
                      const po = row.original.purchaseOrders;
                      const path = `/purchasing/purchase-orders/${po.referenceCode}?id=${po.id}`;
                      rowSelectionHandler('rowClick', path, router);
                    }}
                    initialSortBy={[{ id: "createdAt", desc: true }]}
                  />
                </Card.Root>
              )}
            </>
          ) : (
            <Card.Root>
              <div className="flex items-center justify-center h-full text-neutral-400">
                No items yet.
              </div>
            </Card.Root>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemsTab;
