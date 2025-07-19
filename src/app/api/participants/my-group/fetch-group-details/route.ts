import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { z } from "zod";

const groupDetailSchema = z.object({
  participantId: z.number(),
  groupId: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = groupDetailSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ message: "Invalid input." }, { status: 400 });
    }

    const { participantId, groupId } = parseResult.data;

    // Fetch group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        createdBy: true,
      },
    });

    if (!group || !group.isActive || !group.visibility) {
      return NextResponse.json(
        { message: "Group is not active or not visible." },
        { status: 403 }
      );
    }

    // Fetch participant
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant || !participant.visibility) {
      return NextResponse.json(
        { message: "Participant is not active or has been removed." },
        { status: 403 }
      );
    }

    // Check groupParticipant relation
    const groupParticipant = await prisma.groupParticipant.findFirst({
      where: {
        participantId,
        groupId,
        visibility: true,
      },
    });

    if (!groupParticipant) {
      return NextResponse.json(
        { message: "You are not an active member of this group." },
        { status: 403 }
      );
    }

    // Fetch group participants
    const participants = await prisma.groupParticipant.findMany({
      where: {
        groupId,
        visibility: true,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    const participantList = participants.map((p) => ({
      participantId: p.user.id,
      name: p.user.name,
      email: p.user.email,
      mobileNumber: p.user.mobileNumber,
    }));

    // Fetch exams assigned to group
    const groupExams = await prisma.groupExam.findMany({
      where: { groupId },
      include: {
        exam: true,
      },
    });

    const examList = groupExams.map((ge) => ({
      examId: ge.exam.id,
      title: ge.exam.title,
      status: ge.exam.status, // Active | Scheduled
      examCode: ge.exam.examCode,
      startTime: ge.exam.startTime ? ge.exam.startTime.toISOString() : null, // Send startTime
    }));

    return NextResponse.json({
      message: "Group details fetched successfully.",
      group: {
        groupId: group.id,
        name: group.name,
        description: group.description,
        createdAt: group.createdAt,
        createdBy: group.createdBy.name,
      },
      participants: participantList,
      exams: examList,
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching group details." },
      { status: 500 }
    );
  }
}
