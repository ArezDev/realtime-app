import { Card, CardContent } from "@/components/ui/card";
import TopCountryChart from "../chart/TopCountryChart";
import ReactCountryFlag from "react-country-flag";
import Image from "next/image";
import axios from "axios";
import { RiSmartphoneLine } from "react-icons/ri";
import { FcBarChart, FcFlashOn } from "react-icons/fc";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { ClientDate } from "./clientDate";
import { FaArrowPointer, FaComputer, FaCrown } from "react-icons/fa6";
import { isAfter, isBefore, setHours, setMinutes, setSeconds, addDays } from "date-fns";
import { Clock, Cpu, DollarSign, EarthLock, Globe, MapPin, User, Wifi, X } from "lucide-react";

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

interface TopCountry {
  countryName: string;
  totalLeads: number;
  totalClicks: number;
  cr: any;
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
  total: number;
}

interface DashboardData {
  topCountry: TopCountry[];
  clicks: Click[];
  liveClicks: Click[];
  topUsers: User[];
  leads: Lead[];
  countryData: Record<string, number>;
  topLeads: TopLead[];
}

interface IPInfo {
  ip: string;
  success: boolean;
  type: string;
  continent: string;
  continent_code: string;
  country: string;
  country_code: string;
  region: string;
  region_code: string;
  city: string;
  latitude: number;
  longitude: number;
  is_eu: boolean;
  postal: string;
  calling_code: string;
  capital: string;
  borders: string;
  flag: {
    img: string;
    emoji: string;
    emoji_unicode: string;
  };
  connection: {
    asn: number;
    org: string;
    isp: string;
    domain: string;
  };
  timezone: {
    id: string;
    abbr: string;
    is_dst: boolean;
    offset: number;
    utc: string;
    current_time: string;
  };
  currency: {
    name: string;
    code: string;
    symbol: string;
    plural: string;
    exchange_rate: number;
  };
  security: {
    anonymous: boolean;
    proxy: boolean;
    vpn: boolean;
    tor: boolean;
    hosting: boolean;
  };
}

export function RealtimeTab({ data }: { data: DashboardData }) {

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLiveClick, setSelectedLiveClick] = useState<Click | null>(null);
  const [isOpenLiveClick, setIsOpenLiveClick] = useState(false);
  const [whatIsMyIP, setWhatIsMyIP] = useState<IPInfo | null>(null);
  const [searchUser, setSearchUser] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [CountryData, setCountryData] = useState([]);
  const now = new Date();
  const today5AM = setSeconds(setMinutes(setHours(new Date(), 5), 0), 0);
  const start = now < today5AM ? addDays(today5AM, -1) : today5AM;
  const end = addDays(start, 1);

  useEffect(() => {
    const fetchTopCountry = async () => {
      try {
        const res = await axios.get('/api/top_country');
        if (res.data) {
          setCountryData(res.data.data);
        }
      } catch (error) {
        console.error('Gagal fetch data negara:', error);
      }
    };

    fetchTopCountry(); // pertama kali jalan
    //const interval = setInterval(fetchTopCountry, 120000); // refresh tiap 2 menit

    //return () => clearInterval(interval); // bersihkan interval saat komponen unmount
  }, []);

  const filteredLeads = (data?.leads ?? []).filter((lead) => {
  const createdAt = new Date(lead.created_at);
  return (
    isAfter(createdAt, start) &&
    isBefore(createdAt, end) &&
    lead.userId.toLowerCase().includes(searchUser.toLowerCase()) &&
    lead.country.toLowerCase().includes(searchCountry.toLowerCase())
  );
  });
  const getIPinfo = async (ip: string) => {
    const result = await axios.get(`https://ipwhois.pro/${ip}`, {
      params: { key: "4OehYgGBlw8CpI5x" },
    });
    if (result?.data) {
      setWhatIsMyIP(result.data);
    }
  };

  const openModal = (lead: Lead) => {
    getIPinfo(lead.ip);
    setSelectedLead(lead);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedLead(null);
  };

  const showLiveCLicksInfo = (click: Click) => {
    getIPinfo(click.ip);
    setSelectedLiveClick(click);
    setIsOpenLiveClick(true);
  };

  const closeInfoLiveClick = () => {
    setIsOpenLiveClick(false);
    setSelectedLiveClick(null);
  };

  const getCrownIcon = (username: string) => {
  const index = data.topUsers.findIndex(user => user.username === username);
    switch (index) {
      case 0:
        return <FaCrown className="w-5 h-5 text-yellow-400 animate-bounce" />; // emas
      case 1:
        return <FaCrown className="w-4 h-4 text-gray-400" />;   // perak
      case 2:
        return <FaCrown className="w-4 h-4 text-orange-400" />; // perunggu
      default:
        return null;
    }
  };

  return (
    <div className="pt-0 space-y-6">
      {/* Live Clicks & Top Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Live Clicks */}
        <Card className="rounded-2xl shadow-lg col-span-1 md:col-span-2 lg:col-span-2 w-full 
          bg-gradient-to-r from-lime-50 via-lime-100 to-orange-200 dark:text-white dark:bg-gradient-to-r 
          dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-700
          hover:bg-gradient-to-r hover:from-red-100 hover:via-red-50 hover:to-cyan-200
          dark:hover:bg-gradient-to-r dark:hover:from-zinc-900 dark:hover:via-zinc-700 dark:hover:to-zinc-900
          max-h-[400px] overflow-auto"
        >
        <div className="flex items-start justify-start gap-2 mb-6 p-0">
        <FaArrowPointer className="text-2xl text-blue-500 animate-pulse" />
        <h2 className="font-mono text-1xl text-zinc-800 dark:text-white">Live Clicks</h2>
        </div>

        {/* live clicks content */}
        <div className="p-1 pt-0 text-sm">
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {[...(Array.isArray(data?.liveClicks) ? data.liveClicks : [])]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 15)
              .map((click) => (
                <div
                key={click.id}
                className="live-clicks-row animate-pulse flex flex-wrap items-center gap-x-2 gap-y-1 cursor-pointer"
                onClick={() => showLiveCLicksInfo(click)}
                >
                {/* Flag */}
                <div className="flex-shrink-0 w-5">
                    <ReactCountryFlag
                    countryCode={click.country || "XX"}
                    svg
                    style={{
                        width: "auto",
                        height: "1.2rem",
                        borderRadius: "3px",
                        boxShadow: "0 0 2px rgba(0,0,0,0.15)",
                    }}
                    title={click.country}
                    />
                </div>

                {/* User */}
                <div className="flex-grow min-w-[60px] max-w-[130px] font-mono text-cyan-500 dark:text-teal-300 text-sm break-words">
                    {click.user}
                </div>

                {/* Device Icon */}
                <div className="flex-shrink-0 w-6 text-lg flex justify-center items-center text-zinc-600 dark:text-teal-300">
                    {click.source.match(
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/
                    ) ? (
                    <RiSmartphoneLine />
                    ) : (
                    <FaComputer />
                    )}
                </div>

                {/* IP Address*/}
                <div 
                className="flex-grow min-w-[90px] max-w-[150px] truncate font-serif 
                text-zinc-600 dark:text-teal-300 text-xs break-words"
                title={click.ip}
                >
                  {click.ip.length > 9
                    ? click.ip.slice(0, 9) + "…"
                    : click.ip}
                </div>

                {/* Network Icon */}
                <div className="flex-shrink-0 w-4 text-center text-sm">
                    {
                    click.network.includes('IMONETIZEIT') ? 
                       ( <Image src={'/network/imo.ico'} alt={"iMonetizeIt"} width={17} height={10} /> ) 
                       :
                   click.network.includes('LOSPOLLOS') ? 
                       ( <Image src={'/network/trafee.png'} alt={"Trafee"} width={17} height={10} /> ) 
                       :
                   click.network.includes('TORAZZO') ? 
                       ( <Image src={'/network/lospollos.png'} alt={"Lospollos"} width={17} height={10} /> ) 
                       : (
                           <Globe />
                       ) 
                   }
                </div>

                {/* Browser Icon */}
                <div className="flex-shrink-0 w-4 text-center text-sm">
                    {
                    click.gadget.includes("facebook") ? ( <Image src={'fb.svg'} width={50} height={50} alt={"facebook"} /> )
                    :
                    click.gadget.includes("instagram") ? ( <Image src={'ig.svg'} width={50} height={50} alt={"instagram"} /> )
                    :
                    click.gadget.includes("chrome") ? ( <Image src={'chrome.svg'} width={50} height={50} alt={"chrome"} /> )
                    :
                    click.gadget.includes("safari") ? ( <Image src={'safari.svg'} width={50} height={50} alt={"safari"} /> )
                    :
                    click.gadget.includes("firefox") ? ( <Image src={'firefox.svg'} width={50} height={50} alt={"firefox"} /> )
                    :
                    click.gadget.includes("edge") ? ( <Image src={'edge.svg'} width={50} height={50} alt={"edge"} /> )
                    :
                    (<Image src={'default.svg'} width={50} height={50} alt={"default"} />)
                    }
                </div>

              </div>
            ))}
        </div>

        {/* showed click when opened */}
        {isOpenLiveClick && selectedLiveClick && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4 sm:p-6">
            <div
                className="
                bg-white dark:bg-zinc-900 rounded-3xl shadow-xl
                max-w-sm w-full p-6 relative animate-fade-in-scale
                max-h-[90vh] overflow-y-auto
                "
                style={{ animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
            >
                {/* Close button */}
                <button
                onClick={closeInfoLiveClick}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Close modal"
                >
                <X className="w-5 h-5 text-red-600 dark:text-zinc-300" />
                </button>

                {/* Information Dialog */}
                <h2 className="text-xl font-mono mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
                <FcFlashOn />
                Click: {whatIsMyIP?.country}
                </h2>

                {/* Details list */}
                <div className="space-y-4 text-zinc-700 dark:text-zinc-300 text-sm">
                {/* User */}
                <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold break-words">{selectedLiveClick?.user}</span>
                </div>

                {/* IP */}
                <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="font-mono break-words">{selectedLiveClick.ip}</span>
                </div>

                {/* Device */}
                <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-indigo-500" />
                    <span className="font-serif break-words">{selectedLiveClick.gadget.toUpperCase()}</span>
                </div>

                {/* Full info */}
                <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="font-mono break-words">
                    {whatIsMyIP?.city}, {whatIsMyIP?.region}, {whatIsMyIP?.postal}
                    </span>
                </div>

                {/* ISP */}
                <div className="flex items-center space-x-2">
                    <EarthLock className="w-4 h-4 text-red-500" />
                    <span className="break-words">{whatIsMyIP?.connection.isp}</span>
                </div>

                {/* User Agent */}
                <div className="flex items-center space-x-2">
                    <span className="font-mono break-words">{selectedLiveClick.source}</span>
                </div>
                </div>
            </div>
            </div>
        )}
        </div>
        </Card>

        {/* Top Users */}
        <Card className="rounded-2xl shadow-lg hidden lg:block 
          bg-gradient-to-r from-lime-50 via-lime-100 to-orange-200 
          dark:text-white dark:bg-gradient-to-r dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-700
          hover:bg-gradient-to-r hover:from-red-100 hover:via-red-50 hover:to-cyan-200
          dark:hover:bg-gradient-to-r dark:hover:from-zinc-900 dark:hover:via-zinc-700 dark:hover:to-zinc-900"
        >
            <div className="flex items-start justify-start gap-2 mb-3 p-0">
            <FaCrown className="text-2xl text-[#FFD700] animate-pulse" />
            <h2 className="font-mono text-1xl">Top User</h2>
            </div>
          <div className="p-3">
            {!Array.isArray(data?.topUsers) || data.topUsers.length === 0 ? (
              <p className="italic text-sm text-gray-500 dark:text-gray-400">No top users found.</p>
            ) : (
              <ul className="space-y-1 mt-1 text-zinc-700 dark:text-zinc-200 font-mono">
                {data.topUsers.slice(0, 3).map((user, i) => (
                  <li key={i}>
                    <span className="font-semibold text-blue-500">{i + 1}.</span> {user.username}{" "}
                    <span className="text-sm text-zinc-500">(${user.total.toFixed(2)})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

    {/* Quote */}
    {/* <InfoRealtime /> */}

    {/* Search Input */}
    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
    <input
      type="text"
      placeholder="Search user?"
      value={searchUser}
      onChange={(e) => setSearchUser(e.target.value)}
      className="bg-cyan-50 rounded-md border border-zinc-300
      dark:border-zinc-600 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      type="text"
      placeholder="Country? : US, DE, UK"
      value={searchCountry}
      onChange={(e) => setSearchCountry(e.target.value)}
      className="bg-cyan-50 rounded-md border border-zinc-300 
      dark:border-zinc-600 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-zinc-100 
      focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    </div>

    {/* Table Lead */}
    <div className="overflow-x-auto rounded-xl shadow-md mt-4 border border-zinc-200 dark:border-zinc-700">
        <table className="table-auto min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
            <thead className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 text-white dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              <th className="px-4 py-1 text-left font-semibold whitespace-nowrap">User</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">Country</th>
              <th className="px-3 py-1 text-left font-semibold whitespace-nowrap">Network</th>
              <th className="px-4 py-1 text-left font-semibold whitespace-nowrap hidden md:table-cell">Source</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">Earning</th>
              <th className="px-4 py-1 text-left font-semibold whitespace-nowrap hidden md:table-cell">IP</th>
              <th className="px-4 py-1 text-left font-semibold whitespace-nowrap hidden sm:table-cell">Time</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center px-4 py-6 text-zinc-500 dark:text-zinc-400 italic">
                  No Leads today..
                </td>
              </tr>
            ) : (
            // tabel lead //
             filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="cursor-pointer odd:bg-cyan-100 even:bg-cyan-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                  onClick={() => openModal(lead)}
                >
                {/* UserId */}
                <td className="px-2 py-1 font-serif text-zinc-800 dark:text-zinc-100 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getCrownIcon(lead.userId)} 
                    <span>{lead.userId}</span>
                  </div>
                </td>
                {/* Country */}
                <td className="px-3 py-1 whitespace-nowrap text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <ReactCountryFlag
                    countryCode={lead.country || "XX"}
                    svg
                    style={{ width: "1.5em", height: "1em", borderRadius: "3px", boxShadow: "0 0 2px rgba(0,0,0,0.2)" }}
                    title={lead.country}
                    />
                    <span className="hidden sm:inline">{lead.country}</span>
                </td>
                {/* Network */}
                <td className="px-7 py-1 text-1xl whitespace-nowrap text-zinc-800 dark:text-zinc-100">
                {lead.network.includes('IMONETIZEIT') ? 
                    ( <Image src={'/network/imo.ico'} alt={"iMonetizeIt"} width={17} height={10} /> ) 
                    :
                lead.network.includes('LOSPOLLOS') ? 
                    ( <Image src={'/network/trafee.png'} alt={"Trafee"} width={21} height={10} /> ) 
                    :
                lead.network.includes('TORAZZO') ? 
                    ( <Image src={'/network/lospollos.png'} alt={"Lospollos"} width={17} height={10} /> ) 
                    : (
                        <Globe />
                    ) 
                }
                </td>
                {/* Source */}
                <td className="px-6 py-1 text-2xl whitespace-nowrap hidden md:table-cell">
                    {lead.useragent.includes('WAP') ? (
                    <RiSmartphoneLine />
                    ) : (
                    <FaComputer />
                    )}
                </td>
                {/* Earning */}
                <td className="px-3 py-1 font-mono font-bold text-green-700 dark:text-green-400 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-1">
                  {/* EarningBadge */}
                    {lead.earning >= 40 ? (
                      <span className="animate-bounce inline-block bg-yellow-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        EPIC
                      </span>
                    ) : lead.earning >= 20 ? (
                      <span className="animate-bounce inline-block bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        HOT
                      </span>
                    ) : lead.earning >= 7 ? (
                      <span className="animate-bounce inline-block bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        OK
                      </span>
                    ) : (
                      ""
                    )}
                    <DollarSign className="w-auto h-3 text-green-500" />
                    <span>{lead.earning.toFixed(2)}</span>
                  </div>
                </td>
                {/* IP Address */}
                <td className="px-4 py-1 font-mono text-zinc-800 dark:text-zinc-100 whitespace-nowrap hidden md:table-cell">
                    {lead.ip}
                </td>
                {/* Time */}
                <td className="px-4 py-1 text-zinc-600 dark:text-zinc-400 whitespace-nowrap hidden sm:table-cell">
                    <ClientDate date={lead.created_at} />
                </td>
                </tr>
              ))
            )}
            </tbody>
            <tfoot>
            <tr>
              <td
                colSpan={7}
                className="px-4 py-3 text-left border-t border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm sm:text-base">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-mono">
                    {filteredLeads
                      .reduce((acc, lead) => acc + lead.earning, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* show information about leads */}
        {isOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div 
            className="
            bg-white dark:bg-zinc-900 rounded-3xl shadow-xl 
              max-w-sm w-full p-5 relative animate-fade-in-scale
              mx-6 sm:mx-auto sm:max-w-md
              max-h-[90vh] overflow-auto"
            style={{ animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            </button>
            {/* Title */}
            <h2 className="flex items-center text-1xl font-mono mb-6 text-zinc-900 dark:text-white text-left">
              <FcFlashOn className="mr-2 text-2xl" /> LEAD {whatIsMyIP?.country}
            </h2>
            {/* Details list */}
            <div className="space-y-4 text-zinc-700 dark:text-zinc-300 text-sm">
              {/* User */}
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-blue-500" />
                <span className="font-mono text-1xl">
                  <strong>{selectedLead.userId}</strong>
                </span>
              </div>
              {/* IP Address */}
              <div className="flex items-center space-x-3">
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="font-mono text-1xl">
                  {whatIsMyIP?.ip}
                </span>
              </div>
              {/* Full Address */}
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="font-mono text-1xl">
                  {whatIsMyIP?.region}, {whatIsMyIP?.city}, {whatIsMyIP?.postal}
                </span>
              </div>
              {/* Earning */}
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                <span className="font-mono text-1xl">
                  <strong>Earning: </strong> {selectedLead.earning.toFixed(2)}
                </span>
              </div>
              {/* UA */}
              {/* <div className="flex items-center space-x-3">
                <Cpu className="w-4 h-4 text-purple-500" />
                <span className="font-serif">
                  {selectedLead.useragent}
                </span>
              </div> */}
              {/* Time */}
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span className="font-mono text-1xl">
                  <strong>Waktu Lead: </strong><ClientDate date={selectedLead.created_at} />
                </span>
              </div>
            </div>
          </div>
        </div>
        )}

    </div>

    {/* Chart & Top Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Top Country Chart */}
        {/* <TopCountryChart countryData={data.countryData} /> */}
        <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-cyan-50 via-cyan-100 to-blue-200 
            dark:bg-gradient-to-r dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-700
            hover:bg-gradient-to-r hover:from-blue-300 hover:via-cyan-200 hover:to-cyan-100
            dark:hover:bg-gradient-to-r dark:hover:from-slate-900 dark:hover:via-slate-800 dark:hover:to-slate-950"
        >
        <div className="flex items-start justify-start gap-2 mb-1 p-0">
            <FcBarChart className="text-2xl text-blue-500 animate-pulse" />
            <h2 className="font-mono text-1xl text-zinc-800 dark:text-white">Top Country</h2>
        </div>
          <CardContent className="p-4">
              {(!Array.isArray(CountryData) || CountryData.length === 0) ? (
                <p className="text-sm text-gray-500 dark:text-white-400">Loading...</p>
              ) : (
                <ul className="font-mono text-1xl space-y-2 text-zinc-700 dark:text-white">
                  {CountryData.map(
                    (item: { countryName: string; totalLeads: number; totalClicks: number; cr: any;  }, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-5 h-6">
                          <ReactCountryFlag
                            countryCode={item.countryName || "XX"}
                            svg
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "3px",
                              boxShadow: "0 0 2px rgba(0,0,0,0.15)",
                            }}
                            title={item.countryName}
                          />
                        </div>
                        <span className="truncate">
                          {item.countryName} ({item.totalLeads}) CLICK: {item.totalClicks} CR: {item.cr} </span>
                      </li>
                    )
                  )}
                </ul>
              )}
          </CardContent>
        </Card>
        {/* Top Leads */}
        <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-cyan-50 via-cyan-100 to-blue-200 
            dark:bg-gradient-to-r dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-700
            hover:bg-gradient-to-r hover:from-blue-300 hover:via-cyan-200 hover:to-cyan-100
            dark:hover:bg-gradient-to-r dark:hover:from-slate-900 dark:hover:via-slate-800 dark:hover:to-slate-950"
        >
        <div className="flex items-start justify-start gap-2 mb-4 p-0">
          <FcFlashOn className="text-2xl text-blue-500 animate-pulse" />
          <h2 className="font-mono text-1xl text-zinc-800 dark:text-white">Top Leads</h2>
        </div>
          <CardContent className="p-6">
              {!Array.isArray(data?.topLeads) || data.topLeads.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-white-400">No leads available.</p>
            ) : (
              <ul className="font-mono text-1xl space-y-1 text-zinc-700 dark:text-white">
                {data.topLeads.map((lead, i) => (
                  <li key={i}>
                    {i + 1}. {lead.name} - ${lead.total.toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
