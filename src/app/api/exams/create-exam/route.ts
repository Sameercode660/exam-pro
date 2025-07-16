import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      examCode,
      status,
      createdByAdminId,
      duration,
      startTime,
      endTime,
    } = body;

    const now = new Date();

    // Basic validations
    if (!title || !examCode || !createdByAdminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "Required fields are missing",
        status: false,
      });
    }

    let finalDuration = duration;
    let finalStatus = status;

    // Handle schedule mode safely
    if (startTime && endTime && startTime !== '' && endTime !== '') {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json({
          statusCode: 400,
          message: "Invalid date format",
          status: false,
        });
      }

      // if (start < now) {
      //   return NextResponse.json({
      //     statusCode: 400,
      //     message: "Start time cannot be in the past",
      //     status: false,
      //   });
      // }

      if (end <= start) {
        return NextResponse.json({
          statusCode: 400,
          message: "End time must be after start time",
          status: false,
        });
      }

      // Calculate duration in minutes
      finalDuration = Math.floor((end.getTime() - start.getTime()) / 60000);
      finalStatus = "Scheduled"; // Override status to Scheduled in schedule mode
    }

    // Validate duration
    if (!finalDuration || finalDuration <= 0) {
      return NextResponse.json({
        statusCode: 400,
        message: "Invalid duration",
        status: false,
      });
    }

    // Create the exam
    const newExam = await prisma.exam.create({
      data: {
        title,
        description,
        examCode,
        duration: finalDuration,
        status: finalStatus,
        startTime: startTime && startTime !== '' ? new Date(startTime) : null,
        endTime: endTime && endTime !== '' ? new Date(endTime) : null,
        createdByAdminId,
        updatedByAdminId: createdByAdminId,
        createdById: createdByAdminId,
      },
    });

    return NextResponse.json({
      statusCode: 201,
      message: "Exam created successfully",
      response: newExam,
      status: true,
    });
  } catch (error: any) {
    console.error("Error in create-exam API:", error);

    return NextResponse.json({
      statusCode: 500,
      message: error.message || "Internal Server Error",
      status: false,
    });
  }
}
