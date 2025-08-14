
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import prisma from "@/utils/prisma";
import { UploadType } from "@/generated/prisma";

type RequestTypes = {
    organizationId: number;
    type: UploadType
}


export async function POST(req: NextRequest) {
  try {

    const body = await req.json();
    const {organizationId, type}: Partial<RequestTypes> = body;

    const batches = await prisma.fileUploadSummary.findMany({
      where: {
        admin: {
            organizationId
        },
        type
      },
      orderBy: { createdAt: "desc" },
      select: {
        batchId: true,
        createdAt: true,
        summaryData: true,
      },
    });

    const formatted = batches.map((b) => ({
      batchId: b.batchId,
      label: `batchid-${b.batchId}_${format(new Date(b.createdAt), "yyyy-MM-dd_hh-mm-a")}`,
      summaryData: b.summaryData,
    }));

    return NextResponse.json({ batches: formatted });
  } catch (err) {
    console.error("Error fetching batches:", err);
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}
