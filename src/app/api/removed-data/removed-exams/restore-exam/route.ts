import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examId, userId } = body;

    console.log(examId, userId)
    if (!examId || !userId) {
      return NextResponse.json({ error: "examId and userId are required" }, { status: 400 });
    }

    const updatedExam = await prisma.exam.update({
      where: {
        id: Number(examId),
      },
      data: {
        visibility: true,
        updatedByAdminId: Number(userId), 
      },
    });

    return NextResponse.json({ message: "Exam restored successfully", exam: updatedExam }, { status: 200 });

  } catch (error) {
    console.error("Failed to restore exam:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
