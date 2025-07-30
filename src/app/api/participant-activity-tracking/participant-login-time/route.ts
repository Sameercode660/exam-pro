 
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";


type RequestTypes = {
  participantId: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { participantId }: Partial<RequestTypes> = body;

  if(!participantId) {
    return NextResponse.json({error: 'participant id is not found'}, {status: 400});
  }

  try {
    const entry = await prisma.participantTracking.create({
      data: {
        participantId,
        loginTime: new Date(),
        logoutTime: new Date(),  
        spentTime: 0,   
      },
    });

    return Response.json({ message: "Login tracked", entry });
  } catch (error) {
    console.error("Login Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
