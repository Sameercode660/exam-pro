import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  examId: number;
  userId: number;
}

export async function POST(req: Request) {
  try {
    const { examId, userId }: Partial<RequestTypes> = await req.json();

    const parsedExamId = Number(examId);
    const parsedUserId = Number(userId);

    if (!parsedExamId || isNaN(parsedExamId)) {
      return NextResponse.json(
        { status: false, message: "Invalid examId" },
        { status: 400 }
      );
    }

    if (!parsedUserId || isNaN(parsedUserId)) {
      return NextResponse.json(
        { status: false, message: "Invalid userId" },
        { status: 400 }
      );
    }

    // Fetch all responses of this user for the exam, include question text
    const responses = await prisma.response.findMany({
      where: {
        examId: parsedExamId,
        userId: parsedUserId,
      },
      select: {
        questionId: true,
        selectedOption: true,
        isCorrect: true,
        question: {
          select: {
            text: true,
            correctOption: true,
            options: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    });

    const totalAttempted = responses.length;
    const totalCorrect = responses.filter((r) => r.isCorrect).length;
    const totalWrong = totalAttempted - totalCorrect;

    const correctAnswers = responses
      .filter((r) => r.isCorrect)
      .map((r) => ({
        questionId: r.questionId,
        questionText: r.question.text,
        yourAnswer: r.question.options[r.selectedOption - 1]?.text || "N/A",
        correctAnswer:
          r.question.options[r.question.correctOption - 1]?.text || "N/A",
        status: "correct",
      }));

    const wrongAnswers = responses
      .filter((r) => !r.isCorrect)
      .map((r) => ({
        questionId: r.questionId,
        questionText: r.question.text,
        yourAnswer: r.question.options[r.selectedOption - 1]?.text || "N/A",
        correctAnswer:
          r.question.options[r.question.correctOption - 1]?.text || "N/A",
        status: "wrong",
      }));

    const percentage =
      totalAttempted > 0
        ? Math.round((totalCorrect / totalAttempted) * 100)
        : 0;

    // Save result
    await prisma.result.upsert({
      where: {
        userId_examId: {
          userId: parsedUserId,
          examId: parsedExamId,
        },
      },
      update: {
        score: totalCorrect,
        total: totalAttempted,
      },
      create: {
        userId: parsedUserId,
        examId: parsedExamId,
        score: totalCorrect,
        total: totalAttempted,
      },
    });

    return NextResponse.json({
      status: true,
      message: "Result calculated successfully",
      data: {
        totalAttempted,
        totalCorrect,
        totalWrong,
        percentage,
        correctAnswers,
        wrongAnswers,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      {
        status: false,
        message: err.message || "Server Error",
      },
      { status: 500 }
    );
  }
}
