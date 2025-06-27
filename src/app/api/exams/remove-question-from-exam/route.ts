import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { examId, questionId } = body;

    // Validate inputs
    if (!examId || !questionId) {
      return NextResponse.json(
        { error: "examId and questionId are required." },
        { status: 400 }
      );
    }

    // Fetch the exam to ensure it exists
    const exam = await prisma.exam.findUnique({
      where: { id: Number(examId) },
      include: { questions: true }, // Include questions to verify relationships
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found." },
        { status: 404 }
      );
    }

    // Check if the question is part of the exam
    const questionExists = exam.questions.some((q) => q.id === Number(questionId));
    if (!questionExists) {
      return NextResponse.json(
        { error: "The specified question is not associated with this exam." },
        { status: 400 }
      );
    }

    // Remove the question from the exam
    await prisma.exam.update({
      where: { id: Number(examId) },
      data: {
        questions: {
          disconnect: { id: Number(questionId) }, // Disconnect the question
        },
      },
    });

    return NextResponse.json(
      { message: "Question removed from the exam successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing question from exam:", error);
    return NextResponse.json(
      { error: "An error occurred while removing the question from the exam." },
      { status: 500 }
    );
  }
}
