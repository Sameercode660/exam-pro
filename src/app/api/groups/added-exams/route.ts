import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { groupId } = await req.json();

    if (!groupId) {
      return NextResponse.json({ error: "groupId is required." }, { status: 400 });
    }

    const addedExams = await prisma.groupExam.findMany({
      where: {
        groupId,
        visibility: true,
      },
      include: {
        exam: true,
      },
    });

    return NextResponse.json({ addedExams });
  } catch (err: any) {
    console.error("FetchAddedExams Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
