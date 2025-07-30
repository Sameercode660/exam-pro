import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  examId: number;
  questionId: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestTypes = await req.json();
    const { examId, questionId } = body;

    if (!examId || !questionId) {
      return NextResponse.json({statusCode: 400, message: "Anyone field is empty", status: false});
    }

    // Fetch the exam with its associated questions
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    });

    if (!exam) {
      return NextResponse.json({statusCode: 400, message: 'Exam does not exist', status: false});
    }

    // Check if the question is already added
    const questionExists = exam.questions.some(
      (question) => question.id === questionId
    );

    if (questionExists) {
        return NextResponse.json({statusCode: 400, message: 'This question is already added to the exam.', status: false})
    }

    // Add the question to the exam
    await prisma.exam.update({
      where: { id: examId },
      data: {
        questions: {
          connect: { id: questionId },
        },
      },
    });

    return NextResponse.json({statusCode: 200, message: 'Question Added Succesfully In Exam', status: true});
    
  } catch (error) {
    console.error('Error adding question to exam:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while adding the question.' }),
      { status: 500 }
    );
  }
}
