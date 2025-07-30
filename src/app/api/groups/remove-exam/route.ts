import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  groupExamId: number;
}

export async function POST(req: Request) {
  try {
    const { groupExamId }: RequestTypes = await req.json();

    if (!groupExamId) {
      return NextResponse.json({ error: "groupExamId is required." }, { status: 400 });
    }

    const existing = await prisma.groupExam.findUnique({
      where: { id: groupExamId },
    });

    if (!existing) {
      return NextResponse.json({ error: "GroupExam not found." }, { status: 404 });
    }

    await prisma.groupExam.update({
      where: { id: groupExamId },
      data: { visibility: false },
    });

    return NextResponse.json({ message: "Exam removed from group successfully.", success: true });
  } catch (err: any) {
    console.error("RemoveFromGroup Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
