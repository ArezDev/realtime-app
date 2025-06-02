"use client";

import { use, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RealtimeTab } from "./Dashboardtest";
import { StatsRealtime } from "./stats";
import { SummaryRealtime } from "./summary";
//import { fetchDashboardData } from "@/lib/data";
//import { fetchLiveClicks } from "@/lib/get_klik";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { playAudio } from "@/lib/Notif_lead";
import axios from "axios";

export default function DashboardPage(props: any) {
  const { theme, setTheme } = useTheme();
  const [dashboardData, setDashboardData] = useState(props);
  const [selectedTab, setSelectedTab] = useState("realtime");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Inisialisasi data dashboard saat komponen pertama kali dimuat
    async function refreshData() {
      const newData = await axios.get('/api/dashboard');
      setDashboardData(newData?.data);
    }
    refreshData();
    // Interval untuk memperbarui data klik secara live
    const interval = setInterval(async () => {
      const result = await axios.get('/api/live_click');
      setDashboardData((prev: any) => ({ ...prev, liveClicks: result?.data?.liveClicks }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {

    // Inisialisasi koneksi socket
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      //console.log("Connected with id:", socket.id);
    });

    socket.on("user-lead", async (payload) => {
      console.log(payload);
      setTimeout(async () => {
        //play notif!
          playAudio();
          const newData = await axios.get('/api/dashboard');
          setDashboardData(newData?.data);
      }, 5000); // Delay 5 detik untuk menunggu data terupdate
    });

    socket.on("user-klik", async (payload) => {
      console.log(payload);
      setTimeout(async () => {
        const result = await axios.get('/api/live_click');
        setDashboardData((prev: any) => ({ ...prev, liveClicks: result?.data?.liveClicks }));
      }, 5000); // Delay 5 detik untuk menunggu data terupdate
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    return () => {
      socket.off("user-lead");
      socket.off("user-klik");
      socket.off("disconnect");
      socket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>

        <nav className="sticky top-0 z-50 bg-gray-100 dark:bg-zinc-900 shadow-md dark:border-zinc-700 py-3 flex items-center">
          {/* Kiri: Logo + Tab Hamburger */}
          <div className="flex items-center space-x-4">
            <button
              className="sm:hidden p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle menu"
              onClick={() => {
                setMenuOpen((open) => !open);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <svg
                className="w-6 h-6 text-zinc-900 dark:text-zinc-100"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="text-1xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
              BALANESOHIB
            </div>
          </div>

          {/* Tabs Desktop */}
          <TabsList className="hidden sm:flex ml-10 space-x-6 text-zinc-900 dark:text-zinc-100">
            <TabsTrigger value="realtime">Realtime</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>

          {/* Dark mode button */}
          {isMounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-auto p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-zinc-800" />
              )}
            </button>
          )}
        </nav>
          
        {/* Tabs mobile */}
          {menuOpen && (
            <TabsList className="sm:hidden flex flex-col items-start bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                  <TabsTrigger
                    value="realtime"
                    className="p-2 border-b border-zinc-200 dark:border-zinc-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    Realtime
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    className="p-2 border-b border-zinc-200 dark:border-zinc-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    Stats
                  </TabsTrigger>
                  <TabsTrigger
                    value="leads"
                    className="p-2 border-b border-zinc-200 dark:border-zinc-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    Leads
                  </TabsTrigger>
            </TabsList>
          )}

        {/* Tabs content */}
          <main className="py-4">
            <TabsContent value="realtime">
              <div className="max-w-full overflow-x-auto">
                <RealtimeTab data={dashboardData} />
              </div>
            </TabsContent>
            <TabsContent value="stats">
              <StatsRealtime data={dashboardData} />
            </TabsContent>
            <TabsContent value="leads">
              <SummaryRealtime data={dashboardData} />
            </TabsContent>
          </main>
        </Tabs>

        <footer className="border-t border-zinc-200 dark:border-zinc-700 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Powered by <span className="font-semibold text-zinc-700 dark:text-zinc-200">- ZDEV</span>
        </footer>
      </div>
    </div>

  );
}
