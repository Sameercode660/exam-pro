import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { StagingStatus } from "@/generated/prisma";

type RequestTypes = {
  organizationId: number;
  status: StagingStatus;
  uploadTimestamp: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, status, uploadTimestamp }: Partial<RequestTypes> = body;

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

    if (uploadTimestamp) {
      const target = new Date(uploadTimestamp);
      const toleranceMs = 2 * 60 * 1000;
      whereClause.createdAt = {
        gte: new Date(target.getTime() - toleranceMs),
        lte: new Date(target.getTime() + toleranceMs),
      };
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
