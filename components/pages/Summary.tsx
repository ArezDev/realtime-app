"use client";

import { useEffect, useRef } from "react";
import { useMemo, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Summary {
  id: string;
  user: string;
  total_lead: number;
  total_earning: number;
  total_click: number;
  created_at: Date;
  created_date: string;
}

interface DashboardData {
  hitungLead: Record<string, number>;
  summary: Summary[];
}

export function SummaryRealtime({ data }: { data: DashboardData }) {
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
  const [summary, setSummary] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState(getInitialRange());
  const [searchUser, setSearchUser] = useState("");
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const startDateStr = formatDate(dateRange[0].startDate);
  const endDateStr = formatDate(dateRange[0].endDate);
  async function fetchSummaryByDate (iki: string, yo: string) {
      try {
        //setLoading(true);
          Swal.fire({
            title: "Processing...",
            text: "Fetching summary data...",
            allowOutsideClick: false,
            theme: "auto",
            didOpen: async () => {
              Swal.showLoading();
              const res = await axios.get(`/api/summary_leads`, {
                params: {
                  start: iki,
                  end: yo,
                }
              });
              if (res.data) {
                Swal.close();
                setSummary(res?.data?.summary ?? []);
              }
            },
          });
      } catch (err: any) {
        console.error("Fetch error:", err);
        setSummary([]);
      } finally {
        setLoading(false);
      }
  };
  const groupedSummary = useMemo(() => {
  const grouped = Object.values(
      summary.reduce<Record<string, Summary>>((acc, item) => {
        if (!acc[item.user]) {
          acc[item.user] = { ...item };
        } else {
          acc[item.user].total_click += item.total_click;
          acc[item.user].total_earning;
          acc[item.user].total_lead;
        }
        return acc;
      }, {})
    );
    // Urutkan dari total_earning terbesar ke terkecil
    //return grouped.sort((a, b) => b.total_earning - a.total_earning);
    const sorted = grouped.sort((a, b) => b.total_earning - a.total_earning);
    if (searchUser.trim() === "") return sorted;
    // Filter by search keyword (case-insensitive)
    return sorted.filter((item) =>
      item.user.toLowerCase().includes(searchUser.toLowerCase())
    );
  }, [summary, searchUser]);

  const resetFilters = () => {
    const defaultRange = getInitialRange();
    setDateRange(defaultRange);
    setSearchUser("");
    fetchSummaryByDate(startDateStr, endDateStr);
  };

  const handleExport = () => {
    const csvContent = [
      ["User", "Leads", "CR (%)", "Clicks", "Earning"],
      ...summary?.map((row) => {
        const cr =
          row.total_click > 0
            ? ((row.total_earning / row.total_click) * 100).toFixed(2)
            : "0.00";
        return [
          row.user,
          //row.total_leads?.toString() || "0",
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

  useEffect(()=>{
    setTimeout(() => {
      fetchSummaryByDate(startDateStr, endDateStr);
    }, 500);
  },[]);

  return (
    <div className="pt-0 space-y-6">
      <div className="flex flex-wrap justify-center items-center gap-4 px-3 py-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <button
          onClick={() => setShowDatePicker((v) => !v)}
          className="rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm font-medium dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
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
        >
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Date Picker */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowDatePicker(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 p-4 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol preset di atas date picker */}
            <div className="flex justify-between mb-4 space-x-2">
              <button
                onClick={() => {
                  const now = new Date();
                  const start = new Date(now.setHours(5, 0, 0, 0));
                  const end = new Date(start);
                  end.setDate(start.getDate() + 1);
                  setDateRange([{ startDate: start, endDate: end, key: "selection" }]);
                }}
                className="flex-1 py-2 rounded border border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  now.setDate(now.getDate() - 1);
                  const start = new Date(now.setHours(5, 0, 0, 0));
                  const end = new Date(start);
                  end.setDate(start.getDate() + 1);
                  setDateRange([{ startDate: start, endDate: end, key: "selection" }]);
                }}
                className="flex-1 py-2 rounded border border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Yesterday
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  const day = now.getDay();
                  const daysSinceMonday = day === 0 ? 6 : day - 1;
                  const lastMonday = new Date(now);
                  lastMonday.setHours(5, 0, 0, 0);
                  lastMonday.setDate(now.getDate() - daysSinceMonday - 7);
                  const lastSunday = new Date(lastMonday);
                  lastSunday.setDate(lastMonday.getDate() + 6);
                  setDateRange([{ startDate: lastMonday, endDate: lastSunday, key: "selection" }]);
                }}
                className="flex-1 py-2 rounded border border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Last Week
              </button>
            </div>

            <DateRange
              onChange={(item) => {
                const { startDate, endDate } = item.selection;
                if (startDate && endDate) {
                  setDateRange([
                    {
                      startDate,
                      endDate,
                      key: "selection",
                    },
                  ]);
                }
              }}
              moveRangeOnFirstSelection={false}
              maxDate={new Date()}
              editableDateInputs={false}
              ranges={dateRange}
            />

            <button
              onClick={() => {
                setShowDatePicker(false);
                const start = formatDate(dateRange[0].startDate);
                const end = formatDate(dateRange[0].endDate);
                fetchSummaryByDate(start, end);
              }}
              className="mt-4 w-full py-2 flex justify-center items-center font-mono bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Set
            </button>
          </div>


        </div>
      )}

      {/* Search USER */}
      <div className="w-auto mb-4">
        <input
          type="text"
          placeholder="Search user..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabel Summary */}
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-md">
        <table className="table-auto min-w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500">
            <tr className="text-white uppercase text-xs font-semibold tracking-wide">
              <th className="px-3 py-1">User</th>
              <th className="px-1 py-1">Clicks</th>
              <th className="px-1 py-1">Leads</th>
              <th className="px-2 py-1">CR</th>
              <th className="px-1 py-1">Earning</th>
            </tr>
          </thead>
          <tbody>
            {groupedSummary?.length ? (
              groupedSummary.map((row, i) => {
                const cr =
                  row.total_click > 0
                    ? (row.total_earning / row.total_click) * 100
                    : 0;

                return (
                  <tr
                    key={`summary-${row.id}`}
                    className={`transition-colors duration-200 ${
                      i % 2 === 0
                        ? "bg-cyan-50 dark:bg-zinc-900"
                        : "bg-cyan-100 dark:bg-zinc-800"
                    } hover:bg-blue-100 dark:hover:bg-blue-900`}
                  >
                    <td className="px-2 py-1 font-mono">{row.user}</td>
                    <td className="px-2 py-1 font-mono">{row.total_click}</td>
                    <td className="px-2 py-1 font-mono">{row.total_lead}</td>
                    <td className="px-2 py-1 font-mono">{cr.toFixed(2)}</td>
                    <td className="px-2 py-1 font-mono">${parseFloat(String(row.total_earning)).toFixed(2)}</td>
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
