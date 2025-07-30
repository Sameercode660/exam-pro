import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  questionId: number;
  adminId: number;
}

export async function POST(req: NextRequest) {
  try {

    // fetching question id 
    const {questionId, adminId}: RequestTypes = await req.json();

    // checking the questionId availability
    if(!questionId || !adminId) {
        return NextResponse.json({statusCode: 400, message: 'Anyone field is empty', status: false});
    }

    // finding the question in db
    const question = await prisma.question.findUnique({
        where: {
            id: questionId,
            adminId
        },
        include: {
        category: true, // Includes the related category data
        topic: true,    // Includes the related topic data
        options: true,  // Includes the related options 
      },
    })

    // checking whether question does exist or not
    if(!question) {
        return NextResponse.json({statusCode: 400, message: 'Question does not exist', status: false})
    }

    // sending the question as response 
    return NextResponse.json({statusCode: 200, message: 'Message fetched successfully', response: question,  status: true})


  } catch (error: unknown) {
    console.error("Error in POST request:", error);

    // catching the syntax error
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        statusCode: 500,
        message: error.message,
        status: false,
      });
    } else if (error instanceof Error) {
      return NextResponse.json({
        statusCode: 500,
        message: error.message,
        status: false,
      });
    } else {
      // Generic error handling for unexpected errors
      return NextResponse.json({
        statusCode: 500,
        message: 'Something went wrong' + error,
        status: false,
      });
    }
  }
}
