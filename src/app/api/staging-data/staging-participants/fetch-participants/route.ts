import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { StagingStatus } from "@/generated/prisma";

type RequestTypes = {
  organizationId: number;
  status?: StagingStatus;
  batchId?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, status, batchId }: Partial<RequestTypes> = body;

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

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

    const data = await prisma.stagingParticipant.findMany({
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
    console.error("[PARTICIPANT_FETCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
