import { db } from "./firebaseAdmin";

export async function fetchLiveClicks() {
  // Fetch all klik, sorted by newest first
  const getClicks = db.collection("live_clicks").orderBy("created_at", "desc");
  const getClicksQuery = await getClicks.get();

  const liveClicks: {
    id: string;
    user: string;
    network: string;
    country: any;
    source: any;
    gadget: string;
    ip: any;
    created_at: any;
  }[] = [];

  getClicksQuery.forEach((doc) => {
    const data = doc.data();
    liveClicks.push({
      id: doc.id,
      user: data.user,
      network: data.network,
      country: data.country,
      source: data.source,
      gadget: data.gadget,
      ip: data.ip,
      created_at: data.created_at.toDate(),
    });
  });

  return {
    liveClicks,
  };
}