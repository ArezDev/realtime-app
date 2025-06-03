import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Hindari inisialisasi ulang
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();
const BATCH_LIMIT = 500;

/// 🔁 Hapus live_clicks setiap 1 menit
export const deleteOldLiveClicks = onSchedule(
  { schedule: "every 1 minutes" },
  async () => {
    const oneMinuteAgo = Timestamp.fromDate(new Date(Date.now() - 60 * 1000));
    let totalDeleted = 0;

    while (true) {
      const snapshot = await db
        .collection("live_clicks")
        .where("created_at", "<=", oneMinuteAgo)
        .limit(BATCH_LIMIT)
        .get();

      if (snapshot.empty) break;

      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      totalDeleted += snapshot.size;
      console.log(`🔁 Deleted ${snapshot.size} live_clicks`);
    }

    console.log(`✅ Total deleted live_clicks: ${totalDeleted}`);
  }
);

/// 🔄 Hapus clicks lebih dari 1 hari
export const deleteOldClicks = onSchedule(
  { schedule: "every 60 minutes" },
  async () => {
    const oneDayAgo = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
    let totalDeleted = 0;

    while (true) {
      const snapshot = await db
        .collection("clicks")
        .where("created_at", "<=", oneDayAgo)
        .limit(BATCH_LIMIT)
        .get();

      if (snapshot.empty) break;

      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      totalDeleted += snapshot.size;
      console.log(`🔁 Deleted ${snapshot.size} clicks`);
    }

    console.log(`✅ Total deleted clicks: ${totalDeleted}`);
  }
);

/// 🗑️ Hapus user_summary lebih dari 2 bulan (format string YYYY-MM-DD)
export const deleteOldUserSummaries = onSchedule(
  { schedule: "every day 00:00" },
  async () => {
    const now = new Date();
    now.setMonth(now.getMonth() + 2); // mundur 2 bulan
    const cutoffDate = now.toISOString().split("T")[0]; // "YYYY-MM-DD"

    let totalDeleted = 0;

    while (true) {
      const snapshot = await db
        .collection("user_summary")
        .where("created_date", ">=", cutoffDate)
        .limit(BATCH_LIMIT)
        .get();

      if (snapshot.empty) break;

      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      totalDeleted += snapshot.size;
      console.log(`🔁 Deleted ${snapshot.size} user_summary`);
    }

    console.log(`✅ Total deleted user_summary (<= ${cutoffDate}): ${totalDeleted}`);
  }
);