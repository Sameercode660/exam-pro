import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const questionTitle = req.nextUrl.searchParams.get("questionTitle") || "";
    const adminId = req.nextUrl.searchParams.get("adminId");

    if (!adminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "Admin ID is required",
        status: false,
      });
    }

    // Split the search term into individual words
    const searchTerms = questionTitle.split(" ").filter((term) => term.trim() !== "");

    // Prisma query to fetch questions
    const questions = await prisma.question.findMany({
      where: {
        AND: [
          { adminId: parseInt(adminId) },
          { visibility: true }, // Only visible questions
          {
            OR: searchTerms.map((term) => ({
              text: {
                contains: term,
                mode: "insensitive", // Case-insensitive match
              },
            })),
          },
        ],
      },
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
    console.error("Error in search API:", error);

    return NextResponse.json({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Unexpected error",
      status: false,
    });
  }
}
