import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { examId } = body;

    // Validate the input
    if (!examId) {
      return NextResponse.json(
        { error: "examId is required." },
        { status: 400 }
      );
    }

    // Fetch the exam and its questions
    const exam = await prisma.exam.findUnique({
      where: {
        id: Number(examId),
      },
      include: {
        questions: {
          where: { visibility: true }, // Only include questions with visibility = true
          include: {
            topic: true, // Include topic information
            category: true, // Include category information
            options: true, // Include options for each question
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found." },
        { status: 404 }
      );
    }

    // Ensure the exam itself is visible
    if (!exam.visibility) {
      return NextResponse.json(
        { error: "This exam is not visible." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        message: "Questions fetched successfully.",
        examId: exam.id,
        title: exam.title,
        description: exam.description,
        questions: exam.questions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching exam questions:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the exam questions." },
      { status: 500 }
    );
  }
}
