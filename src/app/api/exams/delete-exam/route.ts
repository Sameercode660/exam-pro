
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();


export async function DELETE(req: NextRequest) {
  try {
    
    const {examId} = await req.json();

    if (!examId) {
      return NextResponse.json({
        statusCode: 400,
        message: "examId is required",
        status: false,
      });
    }

    const deletedExam = await prisma.exam.delete({
      where: { id: parseInt(examId) },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Exam deleted successfully",
      response: deletedExam,
      status: true,
    });
  } catch (error: unknown) {
    console.error("Error in DELETE request:", error);

    return NextResponse.json({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Unexpected error",
      status: false,
    });
  }
}
