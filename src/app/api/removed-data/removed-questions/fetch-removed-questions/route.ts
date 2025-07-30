
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId }: Partial<RequestTypes> = await req.json();

    const visibleQuestions = await prisma.question.findMany({
      where: {
        visibility: false,
        admin: {
          organizationId,
        },
      },
      include: {
        admin: {
          select: {
            name: true,
          },
        },
        updatedByAdmin: {
          select: {
            name: true,
          },
        },
      },
    });

    const formatted = visibleQuestions.map((q) => ({
      id: q.id,
      title: q.text,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      createdBy: q.admin?.name || null,
      removedBy: q.updatedByAdmin?.name || null,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching visible questions:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
