"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardPage from "@/components/pages/Realtime";
import axios from "axios";

interface Click {
  id: string;
  user: string;
  network: string;
  country: string;
  source: string;
  gadget: string;
  ip: string;
  created_at: Date;
}

interface TopLead {
  name: string;
  total: number;
}

interface Lead {
  id: string;
  userId: string;
  network: string;
  country: string;
  useragent: string;
  ip: string;
  earning: number;
  created_at: any;
}

interface User {
  username: string;
  sum: number;
}

interface DashboardData {
  clicks: Click[];
  liveClicks: Click[];
  topUsers: User[];
  leads: Lead[];
  countryData: Record<string, number>;
  topLeads: TopLead[];
}

export default function ClientDashboardWrapper() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth");
        if (res.ok) {
          const DashboardData = axios.get('/api/dashboard');
          setData((await DashboardData).data);
          setLoading(false);
        } else {
          router.push("/login_disek");
        }
      } catch (err) {
        router.push("/login_disek");
      }
    };
    checkAuth();
  }, []);

if (loading || !data)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto"></div>
      </div>
    );
    
  return <DashboardPage {...data} />;
}