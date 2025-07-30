import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  examId: number;
}

export async function POST(req: Request) {
  try {
    const { examId }: Partial<RequestTypes> = await req.json();

    const parsedExamId = Number(examId);

    if (!parsedExamId || isNaN(parsedExamId)) {
      return NextResponse.json(
        { error: "examId is required and must be a valid number" },
        { status: 400 }
      );
    }
    // Fetch the exam details including timing and questions
    const exam = await prisma.exam.findUnique({
      where: { id: parsedExamId, visibility: true },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: {
              select: {
                id: true,
                text: true,
                isCorrect: false, // Hide correct answers from participants
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.status == "Completed") {
      return NextResponse.json(
        { error: "Exam is already completed" },
        { status: 400 }
      );
    }

    // Use startTime and endTime directly from DB
    if (!exam.startTime || !exam.endTime) {
      return NextResponse.json(
        { error: "Exam timing is not set." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      examId: exam.id,
      title: exam.title,
      duration: exam.duration,
      startTime: exam.startTime,
      endTime: exam.endTime,
      questions: exam.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
        })),
      })),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
