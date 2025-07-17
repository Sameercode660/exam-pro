import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { groupId, participantId } = await req.json();

    if (!groupId || !participantId) {
      return NextResponse.json(
        { error: "groupId and participantId are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.groupParticipant.findUnique({
      where: {
        groupId_participantId: {
          groupId,
          participantId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Participant not found in group" },
        { status: 404 }
      );
    }

    await prisma.groupParticipant.update({
      where: {
        groupId_participantId: {
          groupId,
          participantId,
        },
      },
      data: {
        visibility: false,
      },
    });

    return NextResponse.json(
      { message: "Participant removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[REMOVE_GROUP_PARTICIPANT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
