import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function PUT(req: NextRequest) {
  try {
    const {
      id,
      adminId,
      title,
      description,
      examCode,
      duration,
      status,
      startTime,
      endTime,
      updatedByAdminId,
    } = await req.json();

    if (!id || !adminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "Exam ID and Admin ID are required",
        status: false,
      });
    }

    const exam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!exam || exam.createdByAdminId !== adminId) {
      return NextResponse.json({
        statusCode: 404,
        message: "Exam not found or unauthorized",
        status: false,
      });
    }

    let updateData: any = {
      title,
      description,
      examCode,
      duration,
      status,
      updatedByAdminId,
    };

    if (status === "Scheduled") {
      if (!startTime || !endTime) {
        return NextResponse.json({
          statusCode: 400,
          message: "StartTime and EndTime are required for Scheduled exams",
          status: false,
        });
      }

      const start = new Date(startTime);
      const end = new Date(endTime);

      if (end <= start) {
        return NextResponse.json({
          statusCode: 400,
          message: "EndTime must be after StartTime",
          status: false,
        });
      }

      updateData.startTime = start;
      updateData.endTime = end;

    } else if (status === "Active") {
      const now = new Date();
      updateData.startTime = now;
      updateData.endTime = new Date(now.getTime() + duration * 60000);
    } else if (status === "Inactive") {
      updateData.startTime = null;
      updateData.endTime = null;
    }

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: updateData,
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
