import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import db from "@/lib/db";
//import { db } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  const { password } = await req.json();

  //Firebase
  // const cek = db.collection("realtime_access").limit(1);
  // const snapshot = await cek.get();

  // if (snapshot.empty) {
  //   return NextResponse.json({ error: "No credentials set" }, { status: 500 });
  // }

  // Query the user from MySQL database
  const [rows]: any = await db.execute(
    "SELECT password, role FROM realtime_access LIMIT 1"
  );

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "No credentials set" }, { status: 500 });
  }

  const { password: hashedPassword, role } = rows[0];

  const isValid = await bcrypt.compare(password, hashedPassword);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = sign({ role: role }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "strict", path: "/", });
  return res;
}
