import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";


export async function POST(req: NextRequest) {
  try {
    const {examId, adminId} = await req.json();

    if (!examId || !adminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "examId is required",
        status: false,
      });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) , createdByAdminId: parseInt(adminId), visibility: true },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });

    if (!exam) {
      return NextResponse.json({
        statusCode: 404,
        message: "Exam not found",
        status: false,
      });
    }

    return NextResponse.json({
      statusCode: 200,
      message: "Exam fetched successfully",
      response: exam,
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
