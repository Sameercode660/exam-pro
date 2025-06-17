import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";


const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
    try {
        
        const {email, password} = await req.json();

        if(!email || !password) {
            return NextResponse.json({statusCode: 404, message: 'Anyone field is empty', status: false});
        }

        const admin = await prisma.user.findUnique({
            where: {
                email, 
                password
            }
        })

        if(!admin) {
            return NextResponse.json({statusCode: 404, message: 'Admin does not exist', status: false});
        }

        return NextResponse.json({statusCode: 200, message: 'Login successfully', status: true, response: admin});

    } catch (error: unknown) {
        
        if(error instanceof Error) {
            console.log(error.message);

            return NextResponse.json({statusCode: 500, message: error.message, status: false});
        }

        console.log(error)

        return NextResponse.json({statusCode: 500, message: 'Unknown error occurred', status: false});
    }
}
