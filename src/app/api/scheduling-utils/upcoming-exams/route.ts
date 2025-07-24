import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingExams = await prisma.scheduledExamBuffer.findMany({
      where: {
        startTime: {
          gte: now,
          lte: sevenDaysLater,
        },
      },
      select: {
        examId: true,
        startTime: true,
        endTime: true,
      },
    });

    const examIds = upcomingExams.map((exam) => exam.examId);

    if (examIds.length > 0) {
      await prisma.scheduledExamBuffer.updateMany({
        where: {
          id: { in: examIds},
        },
        data: {
          processed: true,
        },
      });
    }
    return NextResponse.json({
      statusCode: 200,
      message: "Fetched upcoming exams from buffer successfully",
      data: upcomingExams,
      status: true,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({
      statusCode: 500,
      message: err.message || "Internal Server Error",
      status: false,
    });
  }
}
