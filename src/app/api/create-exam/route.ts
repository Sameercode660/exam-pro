import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {

    const {title, description, examCode, duration, status} = await req.json();

    if(!title || !description || !examCode || !duration || !status) {
        return NextResponse.json({statusCode: 404, message: 'Anyone field is empty', status: false});
    }

    const checkExamCode = await prisma.exam.findUnique({
        where: {
            examCode
        }
    })

    if(checkExamCode) {
        return NextResponse.json({statusCode: 404, message: 'ExamCode already exists', status: false})
    }

    const exam = await prisma.exam.create({
        data: {
            title,
            description,
            examCode,
            duration,
            status
        }
    });

    if(!exam) {
        return NextResponse.json({statusCode: 500, message: 'Unable to create the exam', status: false})
    }

    return NextResponse.json({statusCode: 200, message: 'Exam created successfully', response: exam, status: true})
  } catch (error: unknown) {

    if (error instanceof Error) {
      console.log(error.message);

      return NextResponse.json({
        statusCode: 500,
        message: error.message,
        status: false,
      });
    }

    console.log(error);

    return NextResponse.json({
      statusCode: 500,
      message: "Unknown error occurred",
      status: false,
    });
  }
}
