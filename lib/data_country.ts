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

export async function fetchCountryData() {
const now = dayjs().tz("Asia/Jakarta");
const startTime = now.hour() < 5
  ? now.subtract(1, "day").hour(5).minute(0).second(0)
  : now.hour(5).minute(0).second(0);
const endTime = startTime.add(24, "hour").subtract(1, "second");

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
const getLead = await db.collection('leads').get();
const countryCount: Record<string, number> = {};
getLead.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
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
      const country = data.country;

      if (country) {
        countryCount[country] = (countryCount[country] || 0) + 1;
      }
    }
  });

const getAllclicksToday = await db.collection("clicks").get();
const Allclicks = getAllclicksToday.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
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
const clickCountryCount: Record<string, number> = {};
let totalCountryClicksToday = 0;
Allclicks.forEach((click) => {
  const clickTime = dayjs(click.created_at).tz("Asia/Jakarta");

  if (clickTime.isSameOrAfter(startTime) && clickTime.isSameOrBefore(endTime)) {
    const country = click.country;
    if (country) {
      clickCountryCount[country] = (clickCountryCount[country] || 0) + 1;
      totalCountryClicksToday++;
    }
  }
});

// === Hitung CR per negara ===
const data = Object.entries(countryCount).map(([countryName, totalLeads]) => {
  const countryClicks = clickCountryCount[countryName] || 0;
  const cr = countryClicks > 0 ? (totalLeads / countryClicks) : 0;
  return {
    countryName,
    totalLeads,
    totalClicks: countryClicks,
    cr: parseFloat((cr * 100).toFixed(2)), // persentase
  };
}).sort((a, b) => b.totalLeads - a.totalLeads);

    return {
        data
    };

}