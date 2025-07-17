import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { groupId } = await req.json();

    if (!groupId) {
      return NextResponse.json({ error: "groupId is required." }, { status: 400 });
    }

    const totalAddedExams = await prisma.groupExam.count({
      where: {
        groupId,
        visibility: true, // assuming soft delete is handled by 'visibility' flag
      },
    });

    return NextResponse.json({ total: totalAddedExams });
  } catch (err: any) {
    console.error("FetchTotalAddedExams Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
