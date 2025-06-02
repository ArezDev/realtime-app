"use client";

import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface Summary {
  id: string;
  user: string;
  total_earning: number;
  total_click: number;
  created_at: Date;
  created_date: string; // format YYYY-MM-DD
}

interface DashboardData {
  hitungLead: any;
  summary: Summary[];
}

export function SummaryRealtime({ data }: { data: DashboardData }) {

  // Default range: hari ini jam 5 pagi sampai besok jam 5 pagi (WIB)
  const getInitialRange = () => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (now.getHours() < 5) {
      start.setDate(now.getDate() - 1);
    }

    start.setHours(5, 0, 0, 0);
    end.setDate(start.getDate() + 1);
    end.setHours(5, 0, 0, 0);

    return [
      {
        startDate: start,
        endDate: end,
        key: "selection",
      },
    ];
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState(getInitialRange);
  const [searchUser, setSearchUser] = useState("");

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const startDateStr = formatDate(dateRange[0].startDate);
  const endDateStr = formatDate(dateRange[0].endDate);

  console.log(data)

  // Filter data berdasarkan tanggal dan pencarian user
  const filteredSummary = (data?.summary ?? []).filter((item) => {
    return (
      item.created_at >= dateRange[0].startDate &&
      item.created_at < dateRange[0].endDate &&
      item.user.toLowerCase().includes(searchUser.toLowerCase().trim())
    );
  });


  const groupedSummary = Object.values(
    filteredSummary.reduce<Record<string, Summary & { total_leads: number }>>(
      (acc, item) => {
        if (!acc[item.user]) {
          acc[item.user] = { 
              ...item, 
              total_click: item.total_click,
              total_earning: item.total_earning,
              total_leads: data?.hitungLead[item.user] || 0,
          };
        } else {
          acc[item.user].total_click += item.total_click;
          acc[item.user].total_earning += item.total_earning;
          acc[item.user].total_leads! += 0;
        }
        return acc;
      },
      {}
    )
  );

  const resetFilters = () => {
    setDateRange(getInitialRange());
    setSearchUser("");
  };

  // Export grouped data ke CSV
  const handleExport = () => {
    const csvContent = [
      ["User", "Leads", "CR (%)", "Clicks", "Earning"],
      ...groupedSummary.map((row) => {
        const cr =
          row.total_click > 0
            ? ((row.total_earning / row.total_click) * 100).toFixed(2)
            : "0.00";
        return [
          row.user,
          row.total_leads?.toString() || "0",
          `${cr}%`,
          row.total_click.toString(),
          `$${row.total_earning.toFixed(2)}`,
        ];
      }),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `summary_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="pt-0 space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap justify-center items-center gap-4 px-3 py-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <button
          onClick={() => setShowDatePicker((v) => !v)}
          className="rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm font-medium dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
          aria-label="Toggle date range picker"
        >
          {startDateStr} to {endDateStr}
        </button>
        <button
          onClick={resetFilters}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          title="Reset filters"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={handleExport}
          className="flex items-end gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          aria-label="Export summary CSV"
        >
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Date range picker */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowDatePicker(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 p-4 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <DateRange
              onChange={(item) => {
                const { startDate, endDate } = item.selection;
                if (startDate && endDate) {
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  start.setHours(5, 0, 0, 0);
                  end.setDate(end.getDate() + 1);
                  end.setHours(5, 0, 0, 0);
                  setDateRange([
                    {
                      startDate: start,
                      endDate: end,
                      key: "selection",
                    },
                  ]);
                }
              }}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              maxDate={new Date()}
              editableDateInputs={false}
            />
            <button
              onClick={() => setShowDatePicker(false)}
              className="mt-5 w-full py-2 flex justify-center items-center font-mono bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              aria-label="Set date range"
            >
              Set
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="w-auto mb-4">
        <input
          type="text"
          placeholder="Search user..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search user"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-md">
        <table className="table-auto min-w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500">
            <tr className="text-white uppercase text-xs font-semibold tracking-wide">
              <th className="px-3 py-1">User</th>
              <th className="px-1 py-1">Clicks</th>
              <th className="px-1 py-1">Leads</th>
              <th className="px-1 py-1">CR (%)</th>
              <th className="px-1 py-1">Earning</th>
            </tr>
          </thead>
          <tbody>
            {groupedSummary.length ? (
              groupedSummary.map((row, i) => {

                const cr =
                  row.total_click > 0
                    ? (row.total_earning / row.total_click) * 100
                    : 0;

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors duration-200 ${
                      i % 2 === 0
                        ? "bg-cyan-50 dark:bg-zinc-900"
                        : "bg-cyan-100 dark:bg-zinc-800"
                    } hover:bg-blue-100 dark:hover:bg-blue-900`}
                  >
                    <td className="px-2 py-1 font-mono">{row.user}</td>
                    <td className="px-2 py-1 font-mono">{row.total_click}</td>
                    <td className="px-2 py-1 font-mono">{row.total_leads}</td>
                    <td className="px-2 py-1 font-mono">{cr.toFixed(2)}</td>
                    <td className="px-2 py-1 font-mono">
                      ${row.total_earning.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center text-zinc-500 dark:text-zinc-400"
                >
                  No data found in selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
