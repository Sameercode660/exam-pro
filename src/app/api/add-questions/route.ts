import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {

    const {examId, text, options, correctOption} = await req.json();

    if(!examId || !text || !options || !correctOption) {
        return NextResponse.json({statusCode: 404, message: "Anyone field is empty", status: false});
    }

    if(correctOption >= 5) {
        return NextResponse.json({statusCode: 404, message: 'Option cannot be greater than 4', status: false})
    }

    if(options.length != 4) {
        return NextResponse.json({statusCode: 404, message: "Four Options must be there", status: false})
    }

    const checkExam = await prisma.exam.findUnique({
        where: {
            id: examId
        }
    })

    if(!checkExam) {
        return NextResponse.json({statusCode: 404, message: 'Exam does not exist', status: false});
    }

    const question = await prisma.question.create({
        data: {
            text,
            options,
            correctOption,
            examId
        }
    })

    if(!question) {
        return NextResponse.json({stautsCode: 500, message: 'Unable to add the question, try again later', status: false});
    }

    return NextResponse.json({statusCode: 200, message: 'Question added successfully', status: true})
  } catch (error) {
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
