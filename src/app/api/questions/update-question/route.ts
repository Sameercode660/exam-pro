import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

export async function PUT(req: NextRequest) {
  try {
    const {
      questionId,
      text,
      categoryName,
      topicName,
      difficulty,
      correctOption,
      options,
      adminId,
    } = await req.json();

    // Validate required fields
    if (!questionId || !categoryName || !topicName || !adminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "Required fields are missing",
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

    // Handle category
    let category = await prisma.category.findFirst({
      where: { name: categoryName, adminId },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          adminId,
        },
      });
    }

    // Handle topic
    let topic = await prisma.topic.findFirst({
      where: { name: topicName, categoryId: category.id, adminId },
    });

    if (!topic) {
      topic = await prisma.topic.create({
        data: {
          name: topicName,
          categoryId: category.id,
          adminId,
        },
      });
    }

    // Prepare options with the correct option flag
    const updatedOptions = options.map((option: { text: string }, index: number) => ({
      text: option.text,
      isCorrect: index + 1 === correctOption, // Set isCorrect to true for the correct option
    }));

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        categoryId: category.id,
        topicId: topic.id,
        difficulty,
        correctOption,
        options: {
          deleteMany: {}, // Delete all existing options for the question
          create: updatedOptions, // Add updated options
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
