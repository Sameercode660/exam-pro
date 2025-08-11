import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(req: NextRequest) {
  try {
    const organizationId = req.nextUrl.searchParams.get("organizationId");
    if (!organizationId) {
      return NextResponse.json({ error: "Missing adminId" }, { status: 400 });
    }

    const batches = await prisma.question.findMany({
      where: {
        batchId: { not: null }, // only linked to a batch
        admin: {
          organizationId: parseInt(organizationId),
        },
      },
      distinct: ["batchId"],
      select: {
        batchId: true,
        batch: {
          select: {
            uploadedAt: true,
            fileName: true,
            status: true,
          },
        },
      },
      orderBy: {
        batch: {
          uploadedAt: "desc",
        },
      },
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
