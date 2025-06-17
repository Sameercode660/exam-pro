import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  try {

    const {adminId} = await req.json();

    const exams = await prisma.exam.findMany({
      where: {
        createdByAdminId: adminId
      },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Exams fetched successfully",
      response: exams,
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
