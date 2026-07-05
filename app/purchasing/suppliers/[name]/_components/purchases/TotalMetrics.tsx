"use client";

import Card from "@/components/Card";
import Layout from "@/components/Layout";
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import {
  SupplierDetailsFilteredPurchases,
  getFilteredPurchases,
} from "../../_actions/getFilteredPurchases";
import ActionButton from "@/components/ActionButton";
import { ApexOptions } from "apexcharts";
import { getPurchasesChartData } from "../../_actions/getPurchasesChartData";
import { useSupplierDetailSelection } from "@/store/supplierDetailSlice";
import DataCard from "./DataCard";
import DataCardText from "./DataCardText";
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits";

const chartOptions: ApexOptions = {
  chart: {
    type: "area",
  },
  stroke: { curve: "smooth" },
};

const TotalMetrics = () => {
  const { purchases } = useSupplierDetailSelection();
  const [dateRangeMode, setDateRangeMode] = useState<
    "yearToDate" | "lastYear" | "all"
  >("yearToDate");
  const [filteredPurchases, setFilteredPurchases] =
    useState<SupplierDetailsFilteredPurchases>();
  const [chartData, setChartData] = useState<any>();

  useEffect(() => {
    const filteredData = getFilteredPurchases(purchases, dateRangeMode);
    setFilteredPurchases(filteredData);

    const chartData = getPurchasesChartData(filteredData.filteredPurchases);
    setChartData(chartData);
  }, [purchases, dateRangeMode]);

  return (
    <div className="flex flex-col gap-6">
      <Layout.Row justify="end">
        <ActionButton
          color={dateRangeMode === "all" ? "secondarySoft" : "neutral"}
          onClick={() => setDateRangeMode("all")}
        >
          All
        </ActionButton>
        <ActionButton
          color={dateRangeMode === "yearToDate" ? "secondarySoft" : "neutral"}
          onClick={() => setDateRangeMode("yearToDate")}
        >
          This Year
        </ActionButton>
        <ActionButton
          color={dateRangeMode === "lastYear" ? "secondarySoft" : "neutral"}
          onClick={() => setDateRangeMode("lastYear")}
        >
          Last Year
        </ActionButton>
      </Layout.Row>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard>
          <DataCardText size="small" color="light">Purchase Orders</DataCardText>
          <DataCardText>{filteredPurchases?.filteredPurchases.length ?? 0}</DataCardText>
        </DataCard>

        <DataCard>
          <DataCardText size="small" color="light">Total Spent</DataCardText>
          <DataCardText>{toFracitonalDigits.curreny(filteredPurchases?.totalSpent ?? 0)}</DataCardText>
        </DataCard>

        <DataCard>
          <DataCardText size="small" color="light">Avg. Order Value</DataCardText>
          <DataCardText>
            {toFracitonalDigits.curreny(
              filteredPurchases && filteredPurchases.filteredPurchases.length > 0
                ? filteredPurchases.totalSpent / filteredPurchases.filteredPurchases.length
                : 0
            )}
          </DataCardText>
        </DataCard>
      </div>

      <Card.Root>
        {filteredPurchases && (
          <Chart
            options={chartOptions}
            series={chartData}
            type="area"
            height={300}
          />
        )}
      </Card.Root>
    </div>
  );
};

export default TotalMetrics;
