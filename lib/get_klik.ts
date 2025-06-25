import db from "./db";
//import { db } from "./firebaseAdmin";

export async function fetchLiveClicks() {
  
  // Fetch all klik, sorted by newest first
  // const getClicks = db.collection("live_clicks").orderBy("created_at", "desc");
  // const getClicksQuery = await getClicks.get();

  // const liveClicks: {
  //   id: string;
  //   user: string;
  //   network: string;
  //   country: any;
  //   source: any;
  //   gadget: string;
  //   ip: any;
  //   created_at: any;
  // }[] = [];

  // getClicksQuery.forEach((doc) => {
  //   const data = doc.data();
  //   liveClicks.push({
  //     id: doc.id,
  //     user: data.user,
  //     network: data.network,
  //     country: data.country,
  //     source: data.source,
  //     gadget: data.gadget,
  //     ip: data.ip,
  //     created_at: data.created_at.toDate(),
  //   });
  // });

  const [rows] = await db.execute(
    "SELECT id, user, network, country, source, gadget, ip, created_at FROM live_clicks ORDER BY created_at DESC"
  );

  const liveClicks = (rows as any[]).map((row) => ({
    id: row.id,
    user: row.user,
    network: row.network,
    country: row.country,
    source: row.source,
    gadget: row.gadget,
    ip: row.ip,
    created_at: row.created_at, // If you want Date object: new Date(row.created_at)
  }));

  return {
    liveClicks,
  };
}