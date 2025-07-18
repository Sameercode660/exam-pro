import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { groupId, examId } = await req.json();

    if (!groupId || !examId) {
      return NextResponse.json(
        { error: "groupId and examId are required." },
        { status: 400 }
      );
    }

    // Check if soft-deleted mapping exists
    const groupExam = await prisma.groupExam.findFirst({
      where: {
        groupId,
        examId,
        visibility: false,
      },
    });

    if (!groupExam) {
      return NextResponse.json(
        { error: "No soft-deleted mapping found for this exam in the group." },
        { status: 404 }
      );
    }

    // Restore the exam by setting visibility to true
    await prisma.groupExam.update({
      where: {
        groupId_examId: { groupId, examId },
      },
      data: {
        visibility: true,
      },
    });

    return NextResponse.json({
      message: "Exam successfully restored to the group.",
      success: true,
    });

  } catch (err: any) {
    console.error("RestoreGroupExam Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
