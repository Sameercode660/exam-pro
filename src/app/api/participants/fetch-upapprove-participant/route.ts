import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await req.json();

    if (!organizationId || typeof organizationId !== "number") {
      return NextResponse.json(
        { error: "organizationId is required and must be a number." },
        { status: 400 }
      );
    }

    const unapprovedParticipants = await prisma.participant.findMany({
      where: {
        organizationId,
        approved: false,
        visibility: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: unapprovedParticipants,
    });

  } catch (err) {
    console.error("Error fetching unapproved participants:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
