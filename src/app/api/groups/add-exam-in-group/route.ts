import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  groupId: number;
  examId: number;
  adminId: number;
};

export async function POST(req: Request) {
  try {
    const { groupId, examId, adminId }: Partial<RequestTypes> = await req.json();

    // Validate inputs
    if (!groupId || !examId || !adminId) {
      return NextResponse.json(
        { error: "groupId, examId, and adminId are required." },
        { status: 400 }
      );
    }

    // Check if the group exists and is active
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group || !group.visibility) {
      return NextResponse.json(
        { error: "Group not found or inactive." },
        { status: 404 }
      );
    }

    // Check if the exam exists and is visible
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true
      }
    });

    if(exam?.questions.length == 0) {
      return NextResponse.json({error: 'Exam has no any question added yet'}, {status: 404});
    }

    if (!exam || !exam.visibility) {
      return NextResponse.json(
        { error: "Exam not found or inactive." },
        { status: 404 }
      );
    }

    // Check for existing group-exam mapping
    const existing = await prisma.groupExam.findFirst({
      where: { groupId, examId },
    });

    if (existing) {
      if (existing.visibility === false) {
        return NextResponse.json({
          message: "Exam exists in group but removed",
          recoverRequired: true,
        });
      }

      return NextResponse.json({
        message: "Exam is already assigned to this group.",
        alreadyAssigned: true,
      });
    }

    // Create new group-exam mapping
    await prisma.groupExam.create({
      data: {
        groupId,
        examId,
        assignedBy: adminId,
      },
    });

    return NextResponse.json({
      message: "Exam successfully added to the group.",
      success: true,
    });
  } catch (err: any) {
    console.error("AddToGroup Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
