import { NextApiRequest, NextApiResponse } from "next";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
//import { db } from "@/lib/firebaseAdmin";
import axios from "axios";
import db from "@/lib/db";

interface LeadData {
  userId: string;
  network: string;
  earning: number;
  country?: string;
  useragent?: string;
  ip?: string;
  created_at: Timestamp;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { leads, earn } = req.query;

  if (!leads || !earn) {
    return res.status(400).json({ error: "Missing parameter!" });
  }

  try {
    const decodedClick = Buffer.from(leads as string, "base64").toString("utf-8");
    const parts = decodedClick.split(",");

    if (parts.length < 5) {
      return res
        .status(400)
        .json({ error: "Invalid lead id format. Expected 5 parts separated by ," });
    }

    const [sub, country, ip, useragent, network] = parts;
    const earningValue = Number(earn);

    if (isNaN(earningValue)) {
      return res.status(400).json({ error: "Invalid earning value" });
    }

    console.log("Checking user:", sub);

    //Firebase
    // const cekUser = await db
    //   .collection("users")
    //   .where("username", "==", sub)
    //   .limit(1)
    //   .get();

    // if (cekUser.empty) {
    //   console.log("User not found:", sub);
    //   return res.status(404).json({ error: `User ${sub} not found` });
    // }

    // const leadData: LeadData = {
    //   userId: sub,
    //   network: network,
    //   earning: earningValue,
    //   country: country || undefined,
    //   useragent: useragent || undefined,
    //   ip: ip || undefined,
    //   created_at: Timestamp.now(),
    // };

    // console.log("Adding lead data for user:", sub);
    // const sendData = await db.collection("leads").add(leadData);
    // if (!sendData) {
    //   return res.status(500).json({ error: "Failed to save lead data" });
    // }

    // Check if user exists in MySQL
    const [rows] = await db.execute(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [sub]
    );

    if (!rows || (Array.isArray(rows) && rows.length === 0)) {
      console.log("User not found:", sub);
      return res.status(404).json({ error: `User ${sub} not found` });
    }

    const leadData = {
      userId: sub,
      network: network,
      earning: earningValue,
      country: country || null,
      useragent: useragent || null,
      ip: ip || null,
      created_at: new Date(),
    };

    console.log("Adding lead data for user (MySQL):", sub);
    const [result] = await db.execute(
      `INSERT INTO leads (userId, network, earning, country, useragent, ip, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
      leadData.userId,
      leadData.network,
      leadData.earning,
      leadData.country,
      leadData.useragent,
      leadData.ip,
      leadData.created_at,
      ]
    );
    if (!result || (result as any).affectedRows !== 1) {
      return res.status(500).json({ error: "Failed to save lead data" });
    }

    // Create consistent doc ID for summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateString = today.toISOString().split("T")[0];
    const summaryId = `${sub}_${dateString}`;
    // const summaryRef = db.collection("user_summary").doc(summaryId);

    // console.log(`Updating summary ${summaryId} with +${earningValue}`);

    // await summaryRef.set(
    //   {
    //     user: sub,
    //     created_date: dateString,
    //     total_earning: FieldValue.increment(earningValue),
    //     total_click: FieldValue.increment(1),
    //     created_at: Timestamp.now(),
    //   },
    //   { merge: true }
    // );

    // Update or insert summary in MySQL
    console.log(`Updating summary ${summaryId} with +${earningValue}`);

    // Try to update existing summary
    const [updateResult] = await db.execute(
      `UPDATE user_summary 
       SET total_earning = total_earning + ?, total_click = total_click + 1 
       WHERE user = ? AND created_date = ?`,
      [earningValue, sub, dateString]
    );

    // If no rows updated, insert new summary row
    if ((updateResult as any).affectedRows === 0) {
      await db.execute(
      `INSERT INTO user_summary (user, created_date, total_earning, total_click, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [sub, dateString, earningValue, 1, new Date()]
      );
    }

    // Trigger realtime update
    await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/broadcast`, {
      event: "user-lead",
      payload: {
        message: `User: ${sub} Lead received..!`,
        data: { ...leadData },
      },
    });

    return res.status(200).json({ message: "Lead received successfully" });
  } catch (error: any) {
    console.error("Error in API:", error);
    return res.status(400).json({
      error: "Invalid base64 in leads parameter",
      errorDetails: error.message,
    });
  }
}