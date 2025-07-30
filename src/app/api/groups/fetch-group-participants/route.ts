import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  groupId: number
}

export async function POST(req: Request) {
  try {
    const { groupId }: RequestTypes = await req.json();

    if (!groupId) {
      return NextResponse.json({ error: "groupId is required" }, { status: 400 });
    }

    const participants = await prisma.groupParticipant.findMany({
      where: {
        groupId,
        isActive: true,
        visibility: true,
        user: {
          visibility: true
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobileNumber: true,
            approved: true,
          },
        },
      },
    });

    return NextResponse.json({ participants }, { status: 200 });
  } catch (error) {
    console.error("[FETCH_GROUP_PARTICIPANTS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
