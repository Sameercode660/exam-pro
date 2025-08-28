import { NextRequest, NextResponse } from "next/server";
import { Difficulty } from "@/generated/prisma";
import prisma from "@/utils/prisma";

type RequestTypes = {
  categoryName: string;
  topicName: string;
  text: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  difficultyLevel: Difficulty;
  adminId: number;
  organizationId: number;
};

export async function POST(req: NextRequest) {
  try {
    const {
      categoryName,
      topicName,
      text,
      option1,
      option2,
      option3,
      option4,
      correctOption,
      difficultyLevel,
      adminId,
      organizationId,
    }: Partial<RequestTypes> = await req.json();

    if (
      !categoryName ||
      !topicName ||
      !text ||
      !option1 ||
      !option2 ||
      !option3 ||
      !option4 ||
      !correctOption ||
      !adminId ||
      !difficultyLevel
    ) {
      return NextResponse.json({
        statusCode: 400,
        message: "Anyone field is empty",
        status: false,
      });
    }

    // Check or create the category
    let category = await prisma.category.findFirst({
      where: {
        admin: {
          organizationId,
        },
        name: {
          equals: categoryName,
          mode: "insensitive",
        },
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName, adminId },
      });
    }

    // Check or create the topic

    let topic = await prisma.topic.findFirst({
      where: {
        name: {
          equals: topicName,
          mode: "insensitive", 
        },
        categoryId: category.id,
        adminId,
      },
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

    // Insert the question and options
    const createdQuestion = await prisma.question.create({
      data: {
        text,
        categoryId: category.id,
        topicId: topic.id,
        difficulty: difficultyLevel.toUpperCase() as Difficulty,
        correctOption: Number(correctOption),
        adminId,
        options: {
          create: [
            { text: option1, isCorrect: correctOption === 1 },
            { text: option2, isCorrect: correctOption === 2 },
            { text: option3, isCorrect: correctOption === 3 },
            { text: option4, isCorrect: correctOption === 4 },
          ],
        },
      },
    });
    console.log(`Created Question ID: ${createdQuestion.id}`);

    if (!createdQuestion) {
      return NextResponse.json({
        statusCode: 500,
        message: "Unable to created the question.",
        status: false,
      });
    }

    // insert into question frequency
    const questionFeq = await prisma.questionFrequency.create({
      data: {
        questionId: createdQuestion.id,
      },
    });

    if (!questionFeq) {
      return NextResponse.json({
        statusCode: 400,
        message: "Unable to create the entry in questionFrequency Table",
        status: false,
      });
    }

    return NextResponse.json({
      statusCode: 200,
      message: "Qeustion created successfully",
      response: createdQuestion,
      status: true,
    });
  } catch (error: unknown) {
    console.error("Error in POST request:", error);

    return NextResponse.json({
      statusCode: 500,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      status: false,
    });
  }
}
