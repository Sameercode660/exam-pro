import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { id, name, email, mobileNumber, updatedById } = await req.json();

    if (!id || !name || !email || !mobileNumber || !updatedById) {
      return NextResponse.json(
        { error: "All fields (id, name, email, mobileNumber, updatedById) are required." },
        { status: 400 }
      );
    }

    // Find participant
    const participant = await prisma.participant.findFirst({
      where: {
        id,
        visibility: true,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found or already deleted." },
        { status: 404 }
      );
    }

    // Check for duplicate email (excluding current participant)
    const emailExists = await prisma.participant.findFirst({
      where: {
        email,
        id: { not: id },
        visibility: true,
      },
    });

    if (emailExists) {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 400 }
      );
    }

    // Check for duplicate mobile number (excluding current participant)
    const mobileExists = await prisma.participant.findFirst({
      where: {
        mobileNumber,
        id: { not: id },
        visibility: true,
      },
    });

    if (mobileExists) {
      return NextResponse.json(
        { error: "Mobile number already exists." },
        { status: 400 }
      );
    }

    // Perform the update
    await prisma.participant.update({
      where: { id },
      data: {
        name,
        email,
        mobileNumber,
        updatedById,
      },
    });

    return NextResponse.json({ message: "Participant updated successfully." });

  } catch (err) {
    console.error("Error updating participant:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
