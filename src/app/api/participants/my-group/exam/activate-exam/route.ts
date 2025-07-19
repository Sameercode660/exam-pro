import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { examId } = await req.json();

    await prisma.exam.update({
      where: { id: examId },
      data: { status: "Active" },
    });

    return NextResponse.json({ message: "Exam activated" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
