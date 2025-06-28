import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  const serializedCookie = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  const response = NextResponse.json({ message: "Logout successful" });
  response.headers.set("Set-Cookie", serializedCookie);

  return response;
}
