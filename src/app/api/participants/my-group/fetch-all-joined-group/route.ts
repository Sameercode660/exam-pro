import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { z } from "zod";

const fetchGroupSchema = z.object({
  participantId: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = fetchGroupSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid input. participantId is required." },
        { status: 400 }
      );
    }

    const { participantId } = parseResult.data;

    // Check participant visibility
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant || !participant.visibility) {
      return NextResponse.json(
        { message: "Participant is not active or has been removed from the organization." },
        { status: 403 }
      );
    }

    // Fetch all groups participant has joined
    const groups = await prisma.groupParticipant.findMany({
      where: {
        participantId,
        isActive: true,
        group: {
          visibility: true
        }
      },
      include: {
        group: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    if (groups.length === 0) {
      return NextResponse.json(
        { message: "No groups found." },
        { status: 404 }
      );
    }

    const groupData = groups.map((gp) => ({
      groupId: gp.group.id,                     // ✅ Return groupId
      groupName: gp.group.name,
      description: gp.group.description || "No description provided.",
      specialInstruction: gp.group.description || "No special instructions.",
      createdAt: gp.group.createdAt,
      createdBy: gp.group.createdBy.name,
      joinedAt: gp.assignedAt,
    }));

    return NextResponse.json({
      message: "Groups fetched successfully.",
      groups: groupData,
    });

  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching groups." },
      { status: 500 }
    );
  }
}
