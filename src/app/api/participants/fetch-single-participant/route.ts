import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  participantId: number;
}

export async function POST(req: NextRequest) {
  try {
    const { participantId }: RequestTypes = await req.json();

    if (!participantId) {
      return NextResponse.json({ error: "participantId is required." }, { status: 400 });
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        approved: true,
        active: true,
        visibility: true,
        organizationId: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Participant not found." }, { status: 404 });
    }

    return NextResponse.json({ participant });

  } catch (err) {
    console.error("Error fetching participant:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
