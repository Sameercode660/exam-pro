import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  name: string; email: string; mobileNumber: string, password: string, organizationId: number
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, mobileNumber, password, organizationId }: Partial<RequestTypes> =
      await req.json();

    // Validate inputs
    if (!name || !email || !mobileNumber || !password || !organizationId) {
      return NextResponse.json(
        {
          error:
            "All fields are required: name, email, mobileNumber, password, organizationId.",
        },
        { status: 400 }
      );
    }

    // Check if participant already exists (email or mobileNumber)
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        AND: [
          {
            OR: [
              { email: email.toLowerCase() },
              { mobileNumber: mobileNumber },
            ],
          },
        ],
      },
    });

    if (existingParticipant) {
      return NextResponse.json(
        {
          error: "Participant with this email or mobile number already exists.",
        },
        { status: 409 }
      );
    }

    // Insert new participant
    const newParticipant = await prisma.participant.create({
      data: {
        name,
        email: email.toLowerCase(),
        mobileNumber,
        password,
        organizationId,
        approved: false,
      },
    });

    return NextResponse.json({
      message: "Participant created successfully (pending approval).",
      participant: {
        id: newParticipant.id,
        name: newParticipant.name,
        email: newParticipant.email,
        mobileNumber: newParticipant.mobileNumber,
        approved: newParticipant.approved,
        organizationId: newParticipant.organizationId,
      },
    });
  } catch (err) {
    console.error("Error creating participant:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
