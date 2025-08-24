import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();

  // Get IST offset in minutes (+330)
  const istOffset = 5.5 * 60 * 60000;
  const istTime = new Date(now.getTime() + istOffset - now.getTimezoneOffset() * 60000);

  return NextResponse.json({ date: istTime.toISOString() });
}