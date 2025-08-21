import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number;
  batchId?: number; 
};

export async function POST(req: NextRequest) {
  try {
    const { organizationId, batchId }: Partial<RequestTypes> = await req.json();

    console.log(batchId)
    if (!organizationId) {
      return NextResponse.json(
        { success: false, message: "organizationId is required" },
        { status: 400 }
      );
    }

    const visibleQuestions = await prisma.question.findMany({
      where: {
        visibility: false,
        admin: {
          organizationId,
        },
        ...(batchId ? { batchId: Number(batchId) } : {}), // filter by batchId only if provided
      },
      include: {
        admin: {
          select: { name: true },
        },
        updatedByAdmin: {
          select: { name: true },
        },
      },
    });

    const formatted = visibleQuestions.map((q) => ({
      id: q.id,
      title: q.text,
      batchId: q.batchId,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      createdBy: q.admin?.name || null,
      removedBy: q.updatedByAdmin?.name || null,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching visible questions:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
