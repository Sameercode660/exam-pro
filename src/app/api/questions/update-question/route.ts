import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";
import { Difficulty } from "@/generated/prisma";

type RequestTypes = {
   questionId: number;
      text: string;
      categoryName: string;
      topicName: string;
      difficulty: string
      correctOption: number
      options: []
      adminId: number
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      questionId,
      text,
      categoryName,
      topicName,
      difficulty,
      correctOption,
      options,
      adminId,
    }: RequestTypes = body;

    // Validate input
    if (!questionId || !text || !categoryName || !topicName || !difficulty || !correctOption || !options || !adminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "All fields are required.",
        status: false,
      });
    }

    // Check existing question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({
        statusCode: 404,
        message: "Question not found.",
        status: false,
      });
    }

    // Handle Category (upsert with composite unique constraint)
    const category = await prisma.category.upsert({
      where: {
        name_adminId: {
          name: categoryName,
          adminId: adminId,
        },
      },
      update: {},
      create: {
        name: categoryName,
        adminId: adminId,
      },
    });

    // Handle Topic (upsert with composite unique constraint)
    const topic = await prisma.topic.upsert({
      where: {
        name_categoryId_adminId: {
          name: topicName,
          categoryId: category.id,
          adminId: adminId,
        },
      },
      update: {},
      create: {
        name: topicName,
        categoryId: category.id,
        adminId: adminId,
      },
    });

    // Update Question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        categoryId: category.id,
        topicId: topic.id,
        difficulty: difficulty as Difficulty,
        correctOption,
        options: {
          deleteMany: {}, // Remove old options
          create: options.map((opt: { text: string }, index: number) => ({
            text: opt.text,
            isCorrect: index + 1 === correctOption,
          })),
        },
      },
      include: {
        category: true,
        topic: true,
        options: true,
      },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Question updated successfully.",
      response: updatedQuestion,
      status: true,
    });

  } catch (error: any) {
    console.error("Error in PUT request:", error);
    return NextResponse.json({
      statusCode: 500,
      message: error.message || "Internal Server Error",
      status: false,
    });
  }
}
