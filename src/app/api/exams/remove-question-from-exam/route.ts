// /exams/remove-questions-from-exam.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  examId: number;
  questionIds: number[];
};

export async function POST(req: NextRequest) {
  try {
    const body: Partial<RequestTypes> = await req.json();
    const { examId, questionIds } = body;

    if (!examId || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: "examId and questionIds[] are required." },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.findUnique({
      where: { id: Number(examId) },
      include: { questions: true },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found." }, { status: 404 });
    }

    const validIds = exam.questions
      .map((q) => q.id)
      .filter((id) => questionIds.includes(id));

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No matching questions found in this exam." },
        { status: 400 }
      );
    }

    await prisma.exam.update({
      where: { id: Number(examId) },
      data: {
        questions: {
          disconnect: validIds.map((id) => ({ id })),
        },
      },
    });

    return NextResponse.json(
      { message: `${validIds.length} questions removed successfully.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing questions from exam:", error);
    return NextResponse.json(
      { error: "An error occurred while removing questions from the exam." },
      { status: 500 }
    );
  }
}
