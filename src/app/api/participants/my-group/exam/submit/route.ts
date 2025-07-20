import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { examId, answers, userId } = await req.json();

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            options: true, // optional, for future use
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ statusCode: 404, message: "Exam not found", status: false });
    }

    const responses = exam.questions.map((q) => {
      const selectedOption = answers[q.id]; // Frontend sends { [questionId]: selectedOption (1-4) }

      if (selectedOption === undefined) {
        return null; // Skip unattempted
      }

      const isCorrect = Number(selectedOption) === q.correctOption;

      return {
        userId,
        examId,
        questionId: q.id,
        selectedOption: Number(selectedOption),
        isCorrect,
      };
    }).filter(Boolean); // Remove nulls

    await prisma.response.createMany({
      data: responses as any[], // TS workaround
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Responses submitted successfully",
      status: true,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({
      statusCode: 500,
      message: err.message,
      status: false,
    });
  }
}
