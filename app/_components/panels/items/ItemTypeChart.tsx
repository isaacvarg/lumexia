'use client'
import { ApexOptions } from "apexcharts"
import Chart from "react-apexcharts";

// Fixed, CVD-safe categorical order (Okabe–Ito subset) assigned by position so a
// given item type keeps its color. Legend below, no per-slice labels (they crowd
// on a narrow donut); the count lives in the tooltip and the donut center total.
const CATEGORICAL = ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#D55E00', '#56B4E9'];

const ItemTypeChart = ({ itemTypes }: {
    itemTypes: {
        itemTypeId: string,
        count: number,
        itemTypeName: string | undefined,
    }[]
}) => {

    const labels = itemTypes.map((it) => it.itemTypeName ?? 'Unknown');
    const series = itemTypes.map((it) => it.count);

    const chartOptions: ApexOptions = {
        chart: {
            type: 'donut',
        },
        labels: labels as string[],
        colors: CATEGORICAL,
        dataLabels: { enabled: false },
        stroke: { width: 2 },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
        },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        name: { show: true },
                        value: { show: true },
                        total: { show: true },
                    },
                }
            }
        },
        responsive: [
            {
                breakpoint: 640,
                options: {
                    chart: { height: 220 },
                    legend: { position: 'bottom' },
                },
            },
        ],
    }

    return (
        <div className="w-full min-w-0">
            <Chart
                options={chartOptions}
                type="donut"
                series={series}
                width="100%"
                height={260}
            />
        </div>
    )
}

export default ItemTypeChart
