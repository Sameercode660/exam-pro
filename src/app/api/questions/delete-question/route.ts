import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  try {
    const { questionId, adminId } = await req.json();

    // Validate input data
    if (!questionId || !adminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "questionId is required",
        status: false,
      });
    }

    // Check if the question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId, adminId },
    });

    if (!existingQuestion) {
      return NextResponse.json({
        statusCode: 400,
        message: "Question does not exist",
        status: false,
      });
    }

    // update the question
    await prisma.question.update({
      where: { id: questionId },
      data: {
        visibility: false
      }
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Question deleted successfully",
      status: true,
    });
  } catch (error: unknown) {
    console.error("Error in DELETE request:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({
        statusCode: 500,
        message: "Invalid JSON format",
        status: false,
      });
    } else if (error instanceof Error) {
      return NextResponse.json({
        statusCode: 500,
        message: error.message,
        status: false,
      });
    } else {
      return NextResponse.json({
        statusCode: 500,
        message: "Something went wrong",
        status: false,
      });
    }
  }
}
