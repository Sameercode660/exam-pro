import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  id: number;
}

export async function POST(req: NextRequest) {
  try {
    const { id }: Partial<RequestTypes> = await req.json();

    if (!id) {
      return NextResponse.json({
        statusCode: 400,
        messsage: "id is missing",
        status: false,
      });
    }

    const admin = await prisma.user.findUnique({
      where: { id },
      include: {
        createdExams: true,
        updatedExams: true,
        questions: true,
        IntResponse: true,
        Category: true,
        Topic: true,
      },
    });

    if (!admin) {
      return NextResponse.json({statusCode: 400, message: "admin does not exist", status: false});
    }

    return NextResponse.json({statusCode: 200, message: 'info fetched suffessfullly', response: admin, status: true});
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({
        statusCode: 500,
        message: error.message,
        status: false,
      });
    }

    return NextResponse.json({
      statusCode: 500,
      message: "There is something wrong in fetching the admin info",
      status: false,
    });
  }
}
