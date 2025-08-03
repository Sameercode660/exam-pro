import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";


type RequestTypes = {
  questionId: number;
  adminId: number;
}

export async function DELETE(req: NextRequest) {
  try {
    const { questionId, adminId }: Partial<RequestTypes> = await req.json();


    console.log(questionId, adminId)
    if (!questionId || !adminId) {
      return NextResponse.json({
        statusCode: 400,
        message: "questionId and adminId are required",
        status: false,
      });
    }

    const existingQuestion = await prisma.question.findFirst({
      where: {
        id: Number(questionId),
        // adminId: Number(adminId),
        visibility: true,
      },
    });

    console.log('Existing question: ', existingQuestion)

    if (!existingQuestion) {
      return NextResponse.json({
        statusCode: 404,
        message: "Question does not exist or is already deleted",
        status: false,
      });
    }

    const response = await prisma.question.update({
      where: { id: Number(questionId) },
      data: { visibility: false, updatedBy: Number(adminId) },
    });

    console.log('Deleted question', response);

    return NextResponse.json({
      statusCode: 200,
      message: "Question deleted successfully",
      status: true,
    });
  } catch (error: unknown) {
    console.error("Error in DELETE request:", error);

    return NextResponse.json({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Something went wrong",
      status: false,
    });
  }
}
