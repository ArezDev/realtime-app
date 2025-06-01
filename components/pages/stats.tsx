"use client";

import ReactCountryFlag from "react-country-flag";
import { ClientDate } from "./clientDate";
import { FaComputer } from "react-icons/fa6";
import { RiSmartphoneLine } from "react-icons/ri";
import { useState } from "react";
import Image from "next/image";
import { Globe } from "lucide-react";

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

interface DashboardData {
  clicks: Click[];
}

export function StatsRealtime({ data }: { data: DashboardData }) {
  
  const [searchUser, setSearchUser] = useState("");
  
  const filteredClicks = data.clicks.filter((click) =>
    click.user.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="pt-0 space-y-6">

    {/* Search Input */}
      <div className="w-full">
        <input
          type="text"
          placeholder="Search user..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

    {/* Clicks Table */}
    <div className="overflow-x-auto rounded-xl shadow-md mt-4 border border-zinc-200 dark:border-zinc-700">
      <table className="table-auto min-w-full text-sm text-left divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 text-white uppercase text-xs font-semibold tracking-wide">
          <tr>
            <th className="px-3 py-1 whitespace-nowrap">user</th>
            <th className="px-4 py-1 whitespace-nowrap">Flag</th>
            <th className="px-2 py-1 whitespace-nowrap">N</th>
            <th className="px-5 py-1 whitespace-nowrap">S</th>
            <th className="px-4 py-1 whitespace-nowrap max-w-[250px]">UA</th>
            <th className="px-4 py-1 whitespace-nowrap">IP</th>
            <th className="px-4 py-1 whitespace-nowrap hidden sm:table-cell">Time</th>
          </tr>
        </thead>
         <tbody>
            {filteredClicks.map((click, i) => (
              <tr
                key={click.id}
                className={`transition-colors duration-200 cursor-default ${
                  i % 2 === 0
                    ? "bg-cyan-50 dark:bg-zinc-900"
                    : "bg-cyan-100 dark:bg-zinc-800"
                } hover:bg-blue-100 dark:hover:bg-blue-900`}
              >
                {/* User */}
                <td className="px-2 py-1 font-mono text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  {click.user}
                </td>

                {/* Country */}
                <td className="px-4 py-1 flex items-center gap-2">
                  <ReactCountryFlag
                    countryCode={click.country || "XX"}
                    svg
                    style={{
                      width: "1.5em",
                      height: "1em",
                      borderRadius: "3px",
                      boxShadow: "0 0 2px rgba(0,0,0,0.2)",
                    }}
                    title={click.country}
                  />
                </td>

                {/* network */}
                <td className="px-1 py-1 text-center text-xl text-zinc-600 dark:text-zinc-400">
                {click.network.includes('IMONETIZEIT') ? 
                    ( <Image src={'/network/imo.ico'} alt={"iMonetizeIt"} width={17} height={10} /> ) 
                    :
                click.network.includes('LOSPOLLOS') ? 
                    ( <Image src={'/network/trafee.png'} alt={"Trafee"} width={20} height={10} /> ) 
                    :
                click.network.includes('TORAZZO') ? 
                    ( <Image src={'/network/lospollos.png'} alt={"Lospollos"} width={17} height={10} /> ) 
                    : (
                        <Globe />
                    ) 
                }
                </td>

                {/* Device */}
                <td className="px-4 py-1 text-center text-xl text-zinc-600 dark:text-zinc-400">
                  {click.source.match(
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/
                  ) ? (
                    <RiSmartphoneLine />
                  ) : (
                    <FaComputer />
                  )}
                </td>

                {/* Source */}
                <td
                  className="px-4 py-1 max-w-[250px] truncate text-zinc-700 dark:text-zinc-300 text-sm select-text"
                  title={click.source}
                >
                  {click.source.length > 75
                    ? click.source.slice(0, 75) + "…"
                    : click.source}
                </td>

                {/* IP */}
                <td className="px-4 py-1 font-mono text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                  {click.ip}
                </td>

                {/* Time */}
                <td className="px-4 py-1 text-zinc-600 dark:text-zinc-400 whitespace-nowrap text-sm hidden sm:table-cell">
                  <ClientDate date={click.created_at} />
                </td>
              </tr>
            ))}
          </tbody>
      </table>
    </div>
    <p className="text-xs text-center text-zinc-500 lg:hidden">Geser ke kanan untuk lihat kolom lainnya →</p>
  </div>
  );
}