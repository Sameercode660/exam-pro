import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ organizations });
  } catch (err) {
    console.error("Error fetching organizations:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
