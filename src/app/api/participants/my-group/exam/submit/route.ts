import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { examId, answers, userId } = await req.json();

    const parsedExamId = Number(examId);
    const parsedUserId = Number(userId);

    if (!parsedExamId || isNaN(parsedExamId)) {
      return NextResponse.json({ statusCode: 400, message: "Invalid examId", status: false });
    }

    if (!parsedUserId || isNaN(parsedUserId)) {
      return NextResponse.json({ statusCode: 400, message: "Invalid userId", status: false });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: parsedExamId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ statusCode: 404, message: "Exam not found", status: false });
    }

    // Prepare responses
    const responses = exam.questions.map((q) => {
      const selectedOption = answers[q.id];

      if (selectedOption === undefined) {
        return null; // Not attempted
      }

      const isCorrect = Number(selectedOption) === q.correctOption;

      return {
        userId: parsedUserId,
        examId: parsedExamId,
        questionId: q.id,
        selectedOption: Number(selectedOption),
        isCorrect,
      };
    }).filter((item): item is {
      userId: number;
      examId: number;
      questionId: number;
      selectedOption: number;
      isCorrect: boolean;
    } => item !== null);

    if (responses.length === 0) {
      return NextResponse.json({
        statusCode: 400,
        message: "No answers provided",
        status: false,
      });
    }

    // Delete old responses (for re-attempt/backlog scenario)
    await prisma.response.deleteMany({
      where: {
        examId: parsedExamId,
        userId: parsedUserId,
      },
    });

    // Insert new responses
    await prisma.response.createMany({
      data: responses,
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Responses submitted successfully (Previous attempt overwritten)",
      status: true,
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({
      statusCode: 500,
      message: err.message || "Server Error",
      status: false,
    });
  }
}
