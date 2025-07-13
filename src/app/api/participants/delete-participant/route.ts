import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
  try {
    const { participantId } = await req.json();

    if (!participantId) {
      return NextResponse.json({ error: "participantId is required." }, { status: 400 });
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      return NextResponse.json({ error: "Participant not found." }, { status: 404 });
    }

    // Update visibility to false (soft delete)
    await prisma.participant.update({
      where: { id: participantId },
      data: { visibility: false },
    });

    return NextResponse.json({ message: "Participant deleted (visibility set to false)." });

  } catch (err) {
    console.error("Error deleting participant:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
