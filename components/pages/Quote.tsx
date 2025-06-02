'use client';

import { FcInfo } from "react-icons/fc";

export default function InfoRealtime() {

    return (
        <div className="w-full">
        <div
            className="inline-flex items-center gap-2 mb-0 
            bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200
            px-4 py-2 rounded-xl shadow-sm border border-blue-300 dark:border-blue-700
            text-sm font-serif transition-all duration-300 max-w-full"
        >
            <FcInfo className="animate-pulse" />
            <span className="whitespace-pre-wrap">Ayo ...ayo .. ayo ... gaskeun..........................!
            </span>
        </div>
        </div>
    );

}