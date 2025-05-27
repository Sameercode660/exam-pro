import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient()

export async function GET() {
    try {
        const exams = await prisma.exam.findMany({});

        if(!exams || exams.length == 0) {
            return NextResponse.json({statusCode: 404, message: 'No any exam is found', response: [], status: false});
        }

        return NextResponse.json({statusCode: 200, message: 'Exam fetched successfully', response: exams, status: true});
    } catch (error: unknown) {
        
        if(error instanceof Error) {
            console.log(error.message);

            return NextResponse.json({statusCode: 500, message: error.message, status: false});
        }

        console.log(error)

        return NextResponse.json({statusCode: 500, message: 'Unknown error occurred', status: false});

    }
}