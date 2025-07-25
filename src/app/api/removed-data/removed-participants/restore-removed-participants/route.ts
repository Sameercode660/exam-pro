import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { participantId } = body;

    if (!participantId) {
      return NextResponse.json({ success: false, message: "Participant ID is required" }, { status: 400 });
    }

    const participant = await prisma.participant.update({
      where: { id: participantId },
      data: { visibility: true },
    });

    return NextResponse.json({
      success: true,
      message: "Participant restored successfully",
      data: participant,
    });
  } catch (error) {
    console.error("Error restoring participant:", error);
    return NextResponse.json(
      { success: false, message: "Failed to restore participant" },
      { status: 500 }
    );
  }
}
