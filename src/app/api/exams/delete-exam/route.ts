import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  examId: number;
  adminId: number;
};

export async function POST(req: NextRequest) {
  try {
    const { examId, adminId }: Partial<RequestTypes> = await req.json();

    if (!examId || !adminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "examId and adminId are required",
        status: false,
      });
    }

    
    const existingExam = await prisma.exam.findFirst({
      where: {
        id: examId,
        createdByAdminId: adminId,
        visibility: true,
      },
    });

    if (!existingExam) {
      return NextResponse.json({
        statusCode: 404,
        message: "Exam not found or already deleted",
        status: false,
      });
    }

    const deletedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        visibility: false, 
        updatedByAdminId: adminId,
      },
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
