import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { adminId, page = 1 } = await req.json();

    // Validate adminId
    if (!adminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "adminId is required",
        status: false,
      });
    }

    const pageSize = 10; // Number of records per page
    const skip = (page - 1) * pageSize; // Calculate how many records to skip

    // Fetch paginated questions with admin details
    const questions = await prisma.question.findMany({
      where: { adminId: parseInt(adminId), visibility: true },
      include: {
        category: true,
        topic: true,
        options: true,
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take: pageSize,
    });

    // Get the total count of questions for pagination info
    const totalQuestions = await prisma.question.count({
      where: { adminId: parseInt(adminId) },
    });

    // Return the paginated questions
    return NextResponse.json({
      statusCode: 200,
      message: "Questions fetched successfully",
      response: {
        questions: questions.map((q) => ({
          ...q,
          createdByName: q.admin?.name || "Unknown",
        })),
        totalQuestions,
        page,
        pageSize,
      },
      status: true,
    });
  } catch (error: unknown) {
    console.error("Error in POST request:", error);

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
