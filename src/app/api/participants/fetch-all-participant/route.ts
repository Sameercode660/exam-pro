import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
  try {
    const { search, filter, organizationId, adminId } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required." }, { status: 400 });
    }

    if (filter !== "all" && filter !== "my") {
      return NextResponse.json({ error: "Invalid filter type." }, { status: 400 });
    }

    const searchWords = search ? search.trim().split(/\s+/) : [];

    // Build where clause
    const whereClause: any = {
      organizationId,
      visibility: true,
      approved: true
    };

    if (filter === "my") {
      if (!adminId) {
        return NextResponse.json({ error: "adminId is required for 'my' filter." }, { status: 400 });
      }
      whereClause.createdById = adminId;
    }

    if (searchWords.length > 0) {
      whereClause.AND = searchWords.map((word: string) => ({
        OR: [
          { name: { contains: word, mode: "insensitive" } },
          { email: { contains: word, mode: "insensitive" } },
          { mobileNumber: { contains: word, mode: "insensitive" } },
        ],
      }));
    }

    const participants = await prisma.participant.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        approved: true,
        createdAt: true,
        createdById: true,
      },
    });

    return NextResponse.json({ participants });

  } catch (err) {
    console.error("Error fetching participants:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
