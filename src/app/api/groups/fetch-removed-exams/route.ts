import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { groupId } = await req.json();

    if (!groupId) {
      return NextResponse.json({ error: "groupId is required." }, { status: 400 });
    }

    const removedExams = await prisma.groupExam.findMany({
      where: {
        groupId,
        visibility: false,
      },
      include: {
        exam: true,
        group: true,
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return NextResponse.json({ removedExams });

  } catch (err: any) {
    console.error("FetchRemovedExams Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
