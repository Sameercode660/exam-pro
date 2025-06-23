import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const categoryId = req.nextUrl.searchParams.get("categoryId");
    const topicId = req.nextUrl.searchParams.get("topicId");
    const difficulty = req.nextUrl.searchParams.get("difficulty");

    // Build the filtering criteria
    const filters: any = {visibility: true};
    if (categoryId) filters.categoryId = parseInt(categoryId);
    if (topicId) filters.topicId = parseInt(topicId);
    if (difficulty) filters.difficulty = difficulty;

    // Fetch questions based on filters
    const questions = await prisma.question.findMany({
      where: filters,
      include: {
        category: true,
        topic: true,
        options: true,
      },
    });

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
      message: error instanceof Error ? error.message : "Unexpected error",
      status: false,
    });
  }
}
