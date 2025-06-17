import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { title, description, examCode, duration, status, createdByAdminId } = await req.json();

    // Validation
    if (!title || !examCode || !duration || !status || !createdByAdminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "Required fields are missing",
        status: false,
      });
    }

    // Create Exam (without questions)
    const newExam = await prisma.exam.create({
      data: {
        title,
        description,
        examCode,
        duration,
        status,
        createdByAdminId,
        updatedByAdminId: createdByAdminId,
      },
    });

    return NextResponse.json({
      statusCode: 201,
      message: "Exam created successfully",
      response: newExam,
      status: true,
    });
  } catch (error: unknown) {
    console.error("Error in POST request:", error);

    return NextResponse.json({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Unexpected error",
      status: false,
    });
  }
}
