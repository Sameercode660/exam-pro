import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  search: string;
  filter: string;
  organizationId: number;
  adminId: number;
  groupId: number;
}

export async function POST(req: NextRequest) {
  try {
    const { search, filter, organizationId, adminId, groupId }: RequestTypes = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required." }, { status: 400 });
    }

    if (filter !== "all" && filter !== "my") {
      return NextResponse.json({ error: "Invalid filter type." }, { status: 400 });
    }

    if (!groupId) {
      return NextResponse.json({ error: "groupId is required." }, { status: 400 });
    }

    const searchWords = search ? search.trim().split(/\s+/) : [];

    const whereClause: any = {
      organizationId,
      visibility: true,
      approved: true,
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

    // Fetch all participants
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

    // Fetch GroupParticipant data for the group
    const groupParticipants = await prisma.groupParticipant.findMany({
      where: { groupId },
      select: {
        participantId: true,
        visibility: true,
      },
    });

    const participantStatusMap = new Map<number, "added" | "removed">();

    groupParticipants.forEach((gp) => {
      participantStatusMap.set(gp.participantId, gp.visibility ? "added" : "removed");
    });

    // Add status to participants
    const participantsWithStatus = participants.map((participant) => {
      const status = participantStatusMap.get(participant.id) || "not_added";

      return {
        ...participant,
        status, // "added" | "removed" | "not_added"
      };
    });

    return NextResponse.json({ participants: participantsWithStatus });

  } catch (err) {
    console.error("Error fetching participants:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
