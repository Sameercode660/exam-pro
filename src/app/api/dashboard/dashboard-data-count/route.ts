import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";


type RequestTypes = {
  adminId: number;
}

export async function POST(req: Request) {
  try {
    const { adminId }: RequestTypes = await req.json();

    if (!adminId) {
      return NextResponse.json(
        { error: "adminId is required" },
        { status: 400 }
      );
    }

    const adminIdInt = adminId;

    // Fetch all required data in parallel
    const [
      totalExams,
      activeExams,
      inactiveExams,
      totalQuestions,
      totalCategories,
      totalTopics,
      adminInfo,
    ] = await Promise.all([
      prisma.exam.count({ where: { createdByAdminId: adminIdInt, visibility: true } }),
      prisma.exam.count({ where: { createdByAdminId: adminIdInt, status: "active", visibility: true } }),
      prisma.exam.count({ where: { createdByAdminId: adminIdInt, status: "inactive", visibility: true } }),
      prisma.question.count({ where: { adminId: adminIdInt, visibility: true } }),
      prisma.category.count({ where: { adminId: adminIdInt } }),
      prisma.topic.count({ where: { adminId: adminIdInt } }),
      prisma.user.findUnique({ where: { id: adminIdInt } }),
    ]);

    console.log(activeExams, inactiveExams)

    // Construct response
    const dashboardData = {
      adminInfo,
      totalExams,
      activeExams,
      inactiveExams,
      totalQuestions,
      totalCategories,
      totalTopics,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
