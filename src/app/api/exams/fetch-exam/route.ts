import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
    try {

        const {createdBy} = await req.json();

        const exams = await prisma.exam.findMany({
            where: {
                createdBy        
            }
        });

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