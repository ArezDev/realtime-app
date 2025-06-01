import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { app } from "@/lib/firebase";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

export async function POST(req: Request) {
  const { password } = await req.json();
  const db = getFirestore(app);
  const q = query(collection(db, "realtime_access"), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return NextResponse.json({ error: "No credentials set" }, { status: 500 });
  }

  const doc = snapshot.docs[0];
  const { password: hashedPassword } = doc.data();

  const isValid = await bcrypt.compare(password, hashedPassword);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = sign({ role: "admin" }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "strict", path: "/", });
  return res;
}
