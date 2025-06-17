import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const {
      questionId,
      text,
      categoryId,
      topicId,
      difficulty,
      correctOption,
      options,
    } = await req.json();

    // Validate required fields
    if (!questionId) {
      return NextResponse.json({
        statusCode: 400,
        message: "questionId is required",
        status: false,
      });
    }

    // Check if the question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!existingQuestion) {
      return NextResponse.json({
        statusCode: 404,
        message: "Question not found",
        status: false,
      });
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        categoryId,
        topicId,
        difficulty,
        correctOption,
        options: {
          deleteMany: {}, // Delete all existing options for the question
          create: options, // Add new options
        },
      },
      include: {
        category: true,
        topic: true,
        options: true, // Include updated options in the response
      },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Question updated successfully",
      response: updatedQuestion,
      status: true,
    });
  } catch (error: unknown) {
    console.error("Error in PUT request:", error);

    return NextResponse.json({
      statusCode: 500,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred",
      status: false,
    });
  }
}
