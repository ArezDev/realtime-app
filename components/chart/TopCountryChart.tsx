"use client";

import { Doughnut } from "react-chartjs-2";
import { Card, CardContent } from "@/components/ui/card";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { FcBarChart } from "react-icons/fc";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TopCountryChartProps {
  countryData: Record<string, number>;
}

export default function TopCountryChart({ countryData }: TopCountryChartProps) {
  if (!countryData || Object.keys(countryData).length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-2">Top Country</h2>
          <p className="text-sm text-gray-500">No country data available.</p>
        </CardContent>
      </Card>
    );
  }

  const colors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#14b8a6", "#eab308"
  ];

  const data = {
    labels: Object.keys(countryData),
    datasets: [
      {
        label: "Leads",
        data: Object.values(countryData),
        backgroundColor: colors.slice(0, Object.keys(countryData).length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <Card className="rounded-2xl shadow-lg transition hover:shadow-2xl 
      bg-gradient-to-r from-blue-200 via-cyan-100 to-cyan-50 dark:text-white
      dark:bg-gradient-to-r dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-700
      hover:bg-gradient-to-r hover:from-blue-300 hover:via-cyan-200 hover:to-cyan-100
      dark:hover:bg-gradient-to-r dark:hover:from-slate-900 dark:hover:via-slate-800 dark:hover:to-slate-950"
    >
      <div className="flex items-start justify-start gap-2 mb-4 p-0">
        <FcBarChart className="text-2xl text-blue-500 animate-pulse" />
        <h2 className="font-mono text-1xl text-zinc-800 dark:text-white">Top Country</h2>
      </div>
      <CardContent className="p-4">
        <div className="relative w-48 h-48 sm:w-full sm:h-64 mx-auto">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
