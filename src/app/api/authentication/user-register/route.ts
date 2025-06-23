import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";


export async function POST(req: NextRequest) {
    try {
        const {name, email, password} = await req.json();

        if(!name || !email || !password) {
            return NextResponse.json({statusCode: 404, message: 'Anyone field is empty', status: false});
        }

        const checkUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if(checkUser) {
            return NextResponse.json({statusCode: 404, message: 'User already exist', status: false});
        }

        const user = await prisma.user.create({
            data: {
                name, 
                email,
                password
            }
        });

        if(!user) {
            return NextResponse.json({statusCode: 404, message: 'Unable to create the user', status: false});
        }

        return NextResponse.json({statusCode: 200, message: 'user registered successfully', response: user, status: true});
    } catch (error: unknown) {
        
        if(error instanceof Error) {
            console.log(error.message);

            return NextResponse.json({statusCode: 500, message: error.message, status: false});
        }

        console.log(error)

        return NextResponse.json({statusCode: 500, message: 'Unknown error occurred', status: false});
    }
}

