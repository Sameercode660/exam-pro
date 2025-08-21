import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { format } from "date-fns";

type RequestTypes = {
    organizationId: number;
    type: string;
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId, type }: Partial<RequestTypes> = await req.json();
    console.log(type)
    if (!organizationId || !type) {
      return NextResponse.json(
        { error: "organizationId and type are required" },
        { status: 400 }
      );
    }

    let data: { batchId: number | null; createdAt: Date }[] = [];

    if (type === "participants") {
      data = await prisma.participant.findMany({
        where: { organizationId, visibility: false },
        select: { batchId: true, createdAt: true },
        distinct: ["batchId"], 
        orderBy: { createdAt: "desc" },
      });
    } else if (type === "questions") {
      data = await prisma.question.findMany({
        where: { admin: { organizationId }, visibility: false }, 
        select: { batchId: true, createdAt: true },
        distinct: ["batchId"],
        orderBy: { createdAt: "desc" },
      });
    } else if (type === "visible-participants") {
      data = await prisma.participant.findMany({
        where: {organizationId, visibility: true}, 
        select: { batchId: true, createdAt: true },
        distinct: ["batchId"],
        orderBy: { createdAt: "desc" },
      });} else {
      return NextResponse.json(
        { error: "Invalid type. Use 'participants' or 'questions'." },
        { status: 400 }
      );
    }

    // format response
    const formatted = data
      .filter(item => item.batchId !== null) // skip null batchIds
      .map(item => ({
        label: `batchId-${item.batchId} - ${format(item.createdAt, "MMM dd, yyyy, hh:mm a")}`,
        batchId: item.batchId!,
      }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    console.error("Error fetching data:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
