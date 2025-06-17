import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Extract adminId from query parameters
    const {adminId} = await req.json();

    // Validate the adminId
    if (!adminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "adminId is required",
        status: false,
      });
    }

    // Fetch all questions for the given adminId
    const questions = await prisma.question.findMany({
      where: { adminId: parseInt(adminId) },
      include: {
        category: true,
        topic: true,
        options: true,
      },
    });

    // Check if questions exist
    if (questions.length === 0) {
      return NextResponse.json({
        statusCode: 404,
        message: "No questions found for the given adminId",
        status: false,
      });
    }

    // Return the questions
    return NextResponse.json({
      statusCode: 200,
      message: "Questions fetched successfully",
      response: questions,
      status: true,
    });
  } catch (error: unknown) {
    console.error("Error in GET request:", error);

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
