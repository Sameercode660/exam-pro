import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId }: Partial<RequestTypes> = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const timestamps = await prisma.$queryRaw<Array<{ createdAt: Date }>>`
      SELECT DISTINCT sq."createdAt"
      FROM "StagingQuestion" sq
      JOIN "User" u ON u."id" = sq."adminId"
      WHERE u."organizationId" = ${Number(organizationId)}
      ORDER BY sq."createdAt" DESC
    `;

    const uploadTimestamps = timestamps.map((entry) => {
      const dt = new Date(entry.createdAt);
      return {
        raw: entry.createdAt.toISOString(),
        formatted: dt.toLocaleString("en-IN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).replace(",", ""),
      };
    });

    return NextResponse.json({ uploadTimestamps });
  } catch (error) {
    console.error("[UPLOAD_TIMESTAMPS_API_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
