// /app/api/exam/conduct/route.ts

import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { examCode } = await req.json();

    if (!examCode) {
      return NextResponse.json({ error: "examCode is required" }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { examCode },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true, // assuming options is an array of strings or a relation
          }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({
      examId: exam.id,
      title: exam.title,
      duration: exam.duration, // in minutes
      questions: exam.questions,
    });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
