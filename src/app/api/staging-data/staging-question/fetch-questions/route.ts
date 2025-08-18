import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { StagingStatus } from "@/generated/prisma";

type RequestTypes = {
  organizationId: number;
  status: StagingStatus;
  batchId: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, status, batchId }: Partial<RequestTypes> =
      body;

    console.log(batchId)
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Build the where clause
    const whereClause: any = {
      admin: {
        organizationId: Number(organizationId),
      },
    };

    if (status && Object.values(StagingStatus).includes(status)) {
      whereClause.status = status;
    }

 if (batchId) {
      whereClause.batchId = Number(batchId);
    }

    const data = await prisma.stagingQuestion.findMany({
      where: whereClause,
      include: {
        admin: {
          select: {
            name: true,
            organizationId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[STAGING_QUESTION_FILTER_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
