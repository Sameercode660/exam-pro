
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  examId: number;
  adminId: number;
}

export async function POST(req: NextRequest) {
  try {
    
    const {examId, adminId}: Partial<RequestTypes> = await req.json();

    if (!examId) {
      return NextResponse.json({
        statusCode: 400,
        message: "examId is required",
        status: false,
      });
    }

    const deletedExam = await prisma.exam.update({
      where: { id: adminId, createdByAdminId: adminId },
      data: {
        visibility: false
      }
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
