import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const { id, title, description, examCode, duration, status, updatedByAdminId } = await req.json();

    if (!id) {
      return NextResponse.json({
        statusCode: 400,
        message: "Exam ID is required",
        status: false,
      });
    }

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        title,
        description,
        examCode,
        duration,
        status,
        updatedByAdminId,
      },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Exam updated successfully",
      response: updatedExam,
      status: true,
    });
  } catch (error: unknown) {
    console.error("Error in PUT request:", error);

    return NextResponse.json({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Unexpected error",
      status: false,
    });
  }
}
