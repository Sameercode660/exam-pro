import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(req: NextRequest) {
  try {
    const categoryId = req.nextUrl.searchParams.get("categoryId");
    const topicId = req.nextUrl.searchParams.get("topicId");
    const difficulty = req.nextUrl.searchParams.get("difficulty");
    const batchId = req.nextUrl.searchParams.get("batchId");
    const adminId = req.nextUrl.searchParams.get("adminId");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

    const filters: any = { visibility: true };
    if (categoryId) filters.categoryId = parseInt(categoryId);
    if (topicId) filters.topicId = parseInt(topicId);
    if (difficulty) filters.difficulty = difficulty;
    if (batchId) filters.batchId = parseInt(batchId);
    if (adminId) filters.adminId = parseInt(adminId);

    const totalCount = await prisma.question.count({ where: filters });

    const questions = await prisma.question.findMany({
      where: filters,
      include: {
        category: true,
        topic: true,
        options: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Questions fetched successfully",
      response: questions,
      total: totalCount,
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
