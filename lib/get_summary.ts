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


export async function fetchSummary(saiki: string | Date | admin.firestore.Timestamp, sampek: string | Date | admin.firestore.Timestamp) {
    
    //hitung total lead by date!
    const hitungLead: Record<string, number> = {};
    // hitung earning lead by user today!
    const hitungEarning: Record<string, number> = {};
    //hitung total click hari ini!
    const hitungClick: Record<string, number> = {};

    // Konversi parameter ke dayjs dan set zona waktu Jakarta
    const startDate = normalizeToDayjs(saiki).tz("Asia/Jakarta");
    const endDate = normalizeToDayjs(sampek).tz("Asia/Jakarta");

    // Range jam 5 pagi - 5 pagi (berdasarkan input)
    const now = startDate.hour(5).minute(0).second(0).millisecond(0);
    const to = endDate.add(1, "day").hour(5).minute(0).second(0).millisecond(0);

    // //cek lead today!
    // const getLeadToday = await db.collection('leads')
    // .where('created_at', '>=', now.toDate()).where('created_at', '<=', to.toDate()).get();
    // getLeadToday.forEach((doc)=> {
    //     const data = doc.data();
    //     if (!data.created_at || !data.userId) return;
    //     const createdAt = dayjs(data.created_at.toDate()).tz("Asia/Jakarta");
    //     if (createdAt.isSameOrAfter(now) && createdAt.isSameOrBefore(to)) {
    //         const userId = data.userId;
    //         const earning = data.earning || 0;
    //         hitungLead[userId] = (hitungLead[userId] || 0) + 1;
    //         hitungEarning[userId] = (hitungEarning[userId] || 0) + earning;
    //     }
    // });
    // //get summary data user!
    // const getSummary = await db.collection('user_summary')
    // .where('created_date', '>=', normalizeToDayjs(saiki).format("YYYY-MM-DD")).where('created_date', '<=', normalizeToDayjs(sampek).format("YYYY-MM-DD")).get();
    // const summary: { 
    //     id: string; 
    //     user: string; 
    //     total_lead: any; 
    //     total_earning: any; 
    //     total_click: any; 
    //     created_at: any; 
    // }[] = [];
    // getSummary.forEach((doc) => {
    //     const data = doc.data();
    //     if (!data.created_at || !data.user || !data.total_click) return;
    //     const userId = data.user;
    //     summary.push({
    //         id: doc.id,
    //         user: userId,
    //         total_lead: hitungLead[userId] || 0,
    //         total_earning: hitungEarning[userId] || 0,
    //         total_click: data.total_click,
    //         created_at: data.created_at.toDate(),
    //     });
    // });

    //Mysql Updated !!!
    //cek lead today!
    // Assume db is a mysql2/promise connection or pool

    // 1. Get leads in the date range
    const [leads] = await db.execute(
      `SELECT userId, earning, created_at FROM leads WHERE created_at >= ? AND created_at <= ?`,
      [now.format("YYYY-MM-DD HH:mm:ss"), to.format("YYYY-MM-DD HH:mm:ss")]
    );

    for (const lead of leads as any[]) {
      if (!lead.created_at || !lead.userId) continue;
      const createdAt = dayjs(lead.created_at).tz("Asia/Jakarta");
      if (createdAt.isSameOrAfter(now) && createdAt.isSameOrBefore(to)) {
        const userId = lead.userId;
        const earning = Number(lead.earning) || 0;
        hitungLead[userId] = (hitungLead[userId] || 0) + 1;
        hitungEarning[userId] = (hitungEarning[userId] || 0) + earning;
      }
    }

    // 2. Get user summary in the date range
    const [summaries] = await db.execute(
      `SELECT id, user, total_click, created_at, created_date FROM user_summary WHERE created_date >= ? AND created_date <= ?`,
      [
        normalizeToDayjs(saiki).format("YYYY-MM-DD"),
        normalizeToDayjs(sampek).format("YYYY-MM-DD")
      ]
    );

    const summary: {
      id: string;
      user: string;
      total_lead: any;
      total_earning: any;
      total_click: any;
      created_at: any;
    }[] = [];

    for (const row of summaries as any[]) {
      if (!row.created_at || !row.user || !row.total_click) continue;
      const userId = row.user;
      summary.push({
        id: row.id,
        user: userId,
        total_lead: hitungLead[userId] || 0,
        total_earning: hitungEarning[userId] || 0,
        total_click: row.total_click,
        created_at: dayjs(row.created_at).toDate(),
      });
    }

    return {
        summary
    }

}