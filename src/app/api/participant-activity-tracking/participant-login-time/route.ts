 
import { NextRequest } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  participantId: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { participantId }: RequestTypes = body;

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
