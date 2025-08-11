// POST /exams/add-questions-in-exam
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  examId: number;
  questionIds: number[];
};

export async function POST(req: NextRequest) {
  const { examId, questionIds }: Partial<RequestTypes> = await req.json();

  if (!examId || !questionIds?.length) {
    return NextResponse.json({
      statusCode: 400,
      message: "Missing fields",
      status: false,
    });
  }

  // Find existing questions in the exam
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: true },
  });

  if (!exam) {
    return NextResponse.json({
      statusCode: 400,
      message: "Exam not found",
      status: false,
    });
  }

  const existingIds = exam.questions.map((q) => q.id);
  const newIds = questionIds.filter((id: number) => !existingIds.includes(id));

  if (newIds.length === 0) {
    return NextResponse.json({
      statusCode: 200,
      message: "No new questions to add.",
      status: true,
    });
  }

  await prisma.exam.update({
    where: { id: examId },
    data: {
      questions: {
        connect: newIds.map((id: number) => ({ id })),
      },
    },
  });

  return NextResponse.json({
    statusCode: 200,
    message: "Questions added successfully",
    status: true,
  });
}
