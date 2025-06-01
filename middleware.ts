import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) return NextResponse.redirect(new URL("/login_disek", request.url));

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin") {
      return NextResponse.redirect(new URL("/login_disek", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login_disek", request.url));
  }
}

export const config = {
  matcher: ["/"], // proteksi halaman root
};