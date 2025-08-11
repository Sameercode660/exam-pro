import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(req: NextRequest) {
  try {
    const adminId = req.nextUrl.searchParams.get("adminId");
    if (!adminId) {
      return NextResponse.json({ error: "Missing adminId" }, { status: 400 });
    }

    const batches = await prisma.uploadBatch.findMany({
      where: { adminId: parseInt(adminId) },
      select: { id: true, fileName: true, status: true, uploadedAt: true },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Batches fetched successfully",
      response: batches,
      status: true,
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json({
      statusCode: 500,
      message: "Internal server error",
      status: false,
    });
  }
}
