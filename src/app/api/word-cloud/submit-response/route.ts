import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";


type RequestTypes = {
    wordCloudId: number;
    participantId: number;
    responseText: string;
}

export async function POST(req: NextRequest) {
  const { wordCloudId, participantId, responseText }: Partial<RequestTypes> = await req.json();

  if(!wordCloudId || !participantId || !responseText) {
    return NextResponse.json({error: 'Anyone field is missing', status: 400})
  }

  try {
    await prisma.wordCloudResponse.create({
      data: {
        wordCloudId,
        participantId,
        responseText,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
