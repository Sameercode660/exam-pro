import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(req: NextRequest) {
  const examId = Number(req.nextUrl.searchParams.get("examId"));

  if (!examId) {
    return NextResponse.json({
      statusCode: 400,
      message: "Exam ID missing",
      status: false,
    });
  }

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

  const questionIds = exam.questions.map((q) => q.id);

  return NextResponse.json({
    statusCode: 200,
    questionIds,
    status: true,
  });
}
