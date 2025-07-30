import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  groupId: number;
  participantIds: [];
};

export async function POST(req: Request) {
  try {
    const { groupId, participantIds }: Partial<RequestTypes> = await req.json();

    if (!groupId || !Array.isArray(participantIds)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Find participants already in the group, along with their names
    const existingGroupParticipants = await prisma.groupParticipant.findMany({
      where: {
        groupId,
        participantId: { in: participantIds },
      },
      select: {
        participantId: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const existingIds = existingGroupParticipants.map((p) => p.participantId);

    // Filter new participants
    const newParticipants = participantIds.filter(
      (id: number) => !existingIds.includes(id)
    );

    // Batch insert new participants
    if (newParticipants.length > 0) {
      await prisma.groupParticipant.createMany({
        data: newParticipants.map((id: number) => ({
          groupId,
          participantId: id,
        })),
        skipDuplicates: true, // Extra safety
      });
    }

    // Extract skipped participant names
    const skippedParticipantNames = existingGroupParticipants.map(
      (p) => p.user.name
    );

    return NextResponse.json({
      message: "Participants processed",
      addedCount: newParticipants.length,
      skippedCount: skippedParticipantNames.length,
      skippedParticipants: skippedParticipantNames, // Array of names
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
