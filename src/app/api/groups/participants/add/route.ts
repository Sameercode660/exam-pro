// POST /api/groups/participants
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  groupId: number;
  participantId: number;
  userId: string;
};

export async function POST(req: NextRequest) {
  try {
    const { groupId, participantId, userId }: RequestTypes = await req.json();

    if (!groupId || !participantId) {
      return NextResponse.json(
        { error: "Group ID and Participant ID are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.groupParticipant.findUnique({
      where: {
        groupId_participantId: {
          groupId: Number(groupId),
          participantId: Number(participantId),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Participant already in group" },
        { status: 409 }
      );
    }

    const added = await prisma.groupParticipant.create({
      data: {
        groupId: Number(groupId),
        participantId: Number(participantId),
        userId: userId ? Number(userId) : null,
      },
    });

    return NextResponse.json(added);
  } catch (err) {
    console.error("Error adding participant:", err);
    return NextResponse.json(
      { error: "Failed to add participant" },
      { status: 500 }
    );
  }
}
