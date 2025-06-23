import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
    try {
        const {email, password} = await req.json();

        if(!email || !password) {
            return NextResponse.json({statusCode: 404, message: 'Anyone field is empty', stutus: false});
        }

        const user = await prisma.user.findUnique({
            where: {
                email,
                password
            }
        });

        if(!user) {
            return NextResponse.json({statusCode: 404, message: 'User does not exist, please signup', status: false});
        }

        return NextResponse.json({statusCode: 200, message: 'User login successfully', response: user, status: true});
        
    } catch (error: unknown) {

         if(error instanceof Error) {
            console.log(error.message);

            return NextResponse.json({statusCode: 500, message: error.message, status: false});
        }

        console.log(error)

        return NextResponse.json({statusCode: 500, message: 'Unknown error occurred', status: false});
    }
}