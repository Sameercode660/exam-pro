import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
    wordCloudId: number;
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wordCloudId }: Partial<RequestTypes> = body;

    if (!wordCloudId || typeof wordCloudId !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid wordCloudId" },
        { status: 400 }
      );
    }

    const frequencies = await prisma.wordFrequency.findMany({
      where: { wordCloudId },
      select: { word: true, count: true },
    });
    console.log(frequencies)
    return NextResponse.json(frequencies, { status: 200 });
  } catch (error) {
    console.error("Error fetching word frequencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch word frequencies" },
      { status: 500 }
    );
  }
}
