import { db } from "./firebaseAdmin";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export async function fetchDashboardData() {
  const now = dayjs().tz("Asia/Jakarta");
  const todayDate = now.format("YYYY-MM-DD");
  const currentHour = now.format("HH");

  const startTime = now.hour() < 5
    ? now.subtract(1, "day").hour(5).minute(0).second(0)
    : now.hour(5).minute(0).second(0);
  const endTime = startTime.add(24, "hour").subtract(1, "second");

  // === Ambil semua leads ===
  const leadQuery = db.collection("leads").orderBy("created_at", "desc");
  const leadSnapshot = await leadQuery.get();

  const leads: {
    id: string;
    userId: string;
    country: any;
    network: string;
    useragent: any;
    ip: any;
    earning: any;
    created_at: any;
  }[] = [];

  const earningPerUser: Record<string, number> = {};
  const topLeadMap: Record<string, number> = {};
  const countryCount: Record<string, number> = {};
  const hitungLead: Record<string, number> = {};

  leadSnapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
    const data = doc.data();
    if (!data.created_at || !data.userId) return;

    const createdAt = dayjs(data.created_at.toDate()).tz("Asia/Jakarta");

    if (createdAt.isSameOrAfter(startTime) && createdAt.isSameOrBefore(endTime)) {
      leads.push({
        id: doc.id,
        userId: data.userId,
        country: data.country,
        network: data.network,
        useragent: data.useragent,
        ip: data.ip,
        earning: data.earning || 0,
        created_at: createdAt.toDate(),
      });

      const userId = data.userId;
      const earning = data.earning || 0;
      const country = data.country;

      earningPerUser[userId] = (earningPerUser[userId] || 0) + earning;
      topLeadMap[userId] = (topLeadMap[userId] || 0) + earning;
      hitungLead[userId] = (hitungLead[userId] || 0) + 1;

      if (country) {
        countryCount[country] = (countryCount[country] || 0) + 1;
      }
    }
  });

  const topUsers = Object.entries(earningPerUser)
    .map(([username, total]) => ({ username, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const topLeads = Object.entries(topLeadMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const topCountry = Object.entries(countryCount)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  // === Ambil 45 klik terakhir ===
  const clickSnapshot = db.collection("clicks").orderBy("created_at", "desc").limit(45);
  const clicksQuery = await clickSnapshot.get();
  const clicks = clicksQuery.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
    const data = doc.data();
    return {
      id: doc.id,
      user: data.user,
      network: data.network,
      country: data.country,
      source: data.source,
      gadget: data.gadget,
      ip: data.ip,
      created_at: data.created_at.toDate(),
    };
  });

  // === Ambil 15 live clicks terakhir ===
  const liveClickSnapshot = db.collection("live_clicks").orderBy("created_at", "desc").limit(15);
  const liveClickQuery = await liveClickSnapshot.get();
  const liveClicks = liveClickQuery.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
    const data = doc.data();
    return {
      id: doc.id,
      user: data.user,
      network: data.network,
      country: data.country,
      source: data.source,
      gadget: data.gadget,
      ip: data.ip,
      created_at: data.created_at.toDate(),
    };
  });

  // === Ambil summary terakhir ===
  const summarySnapshot = db.collection("user_summary").orderBy("created_at", "desc");
  const summaryQuery = await summarySnapshot.get();
  const summary = summaryQuery.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
    const data = doc.data();
    return {
      id: doc.id,
      user: data.user,
      total_earning: data.total_earning,
      total_click: data.total_click,
      created_at: data.created_at.toDate(),
      created_date: data.created_date,
      created_hour: data.created_hour,
      created_week: data.created_week,
    };
  });

  // === Hitung clicks per user di jam sekarang ===
  const clicksPerUserHour: Record<string, number> = {};
  clicks.forEach((click) => {
    const clickTime = dayjs(click.created_at).tz("Asia/Jakarta");
    const clickDate = clickTime.format("YYYY-MM-DD");
    const clickHour = clickTime.format("HH");

    if (clickDate === todayDate && clickHour === currentHour) {
      clicksPerUserHour[click.user] = (clicksPerUserHour[click.user] || 0) + 1;
    }
  });

  return {
    topUsers,
    topLeads,
    leads,
    hitungLead,
    clicks,
    liveClicks,
    summary,
    countryData: countryCount,
    topCountry,
  };
}