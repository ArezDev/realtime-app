import * as admin from "firebase-admin";
//import { db } from "./firebaseAdmin";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Timestamp } from "firebase-admin/firestore";
import db from "./db";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

function getFilterRange() {
  const now = dayjs().tz("Asia/Jakarta");

  // Hitung jam sekarang
  const hour = now.hour();

  let start: dayjs.Dayjs;
  let end: dayjs.Dayjs;

  // Kalau jam sebelum jam 5 pagi, ambil range dari 5 pagi kemarin sampai 5 pagi hari ini
  if (hour < 5) {
    start = now.subtract(1, "day").hour(5).minute(0).second(0).millisecond(0);
    end = now.hour(5).minute(0).second(0).millisecond(0);
  } else {
    // Kalau jam sudah 5 pagi ke atas, ambil range dari 5 pagi hari ini sampai 5 pagi besok
    start = now.hour(5).minute(0).second(0).millisecond(0);
    end = now.add(1, "day").hour(5).minute(0).second(0).millisecond(0);
  }

  return { start, end };
}

function normalizeToDayjs(
  value: string | Date | FirebaseFirestore.Timestamp | dayjs.Dayjs
): dayjs.Dayjs {
  if (dayjs.isDayjs(value)) return value;
  if (value instanceof admin.firestore.Timestamp) return dayjs(value.toDate());
  return dayjs(value);
}

// Ambil rentang created_date (05:00 hari ini - 05:00 besok)
function getCreatedDateFromRange(date: dayjs.Dayjs): string {
  return date.hour() < 5
    ? date.subtract(1, "day").format("YYYY-MM-DD")
    : date.format("YYYY-MM-DD");
}


export async function fetchSummary(saiki: string | Date | admin.firestore.Timestamp, sampek: string | Date | admin.firestore.Timestamp) {
    
    const hitungLead: Record<string, number> = {};
  const hitungEarning: Record<string, number> = {};

  const startDate = normalizeToDayjs(saiki).tz("Asia/Jakarta");
  const endDate = normalizeToDayjs(sampek).tz("Asia/Jakarta");

  const now = startDate.hour(5).minute(0).second(0).millisecond(0);
  const to = endDate.add(1, "day").hour(5).minute(0).second(0).millisecond(0);

  const [leads] = await db.execute(
    `SELECT userId, earning, created_at FROM leads WHERE created_at >= ? AND created_at <= ?`,
    [now.toDate(), to.toDate()]
  );
  

  for (const lead of leads as any[]) {
    if (!lead.created_at || !lead.userId) continue;

    const userId = String(lead.userId).trim().toLowerCase();
    const earning = parseFloat(lead.earning) || 0;

    hitungLead[userId] = (hitungLead[userId] || 0) + 1;
    hitungEarning[userId] = (hitungEarning[userId] || 0) + earning;
  }

  const leads_row = (leads as any[]).map((row) => ({
    userID: row.userId
  }));


  // Ambil rentang created_date yang sesuai dengan 05:00 WIB
  const createdDateStart = getCreatedDateFromRange(startDate);
  const createdDateEnd = getCreatedDateFromRange(endDate);

  const [summaries] = await db.execute(
      `SELECT id, user, total_click, total_earning, created_at, created_date FROM user_summary 
      WHERE created_date >= ? AND created_date <= ?`,
      [
        normalizeToDayjs(saiki).format("YYYY-MM-DD"),
        normalizeToDayjs(sampek).format("YYYY-MM-DD")
      ]
    );

  const summary: {
    id: string;
    user: string;
    total_lead: number;
    total_earning: number;
    total_click: number;
    created_at: Date;
  }[] = [];

  for (const row of summaries as any[]) {
    if (!row.created_at || !row.user) continue;

    const userId = String(row.user).trim().toLowerCase();

    summary.push({
      id: row.id,
      user: userId,
      total_lead: hitungLead[userId] || 0,
      total_earning: Number((hitungEarning[userId] || 0).toFixed(2)),
      total_click: row.total_click,
      created_at: dayjs(row.created_at).toDate(),
    });
  }

  const summary_row = (summaries as any[]).map((row) => ({
      id: row.id,
      user: row.user,
      total_earning: row.total_earning,
      total_click: row.total_click,
      created_at: dayjs(row.created_at).toDate(),
      created_date: row.created_date,
      created_hour: row.created_hour,
      created_week: row.created_week,
    }));

  return { 
    leads_row,
    summary_row
  };


}