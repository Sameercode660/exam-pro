import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
    id: number;
}

export async function POST(req: NextRequest) {

  try {
    const { id }: Partial<RequestTypes> = await req.json();

    if (!id || isNaN(Number(id))) {
        return NextResponse.json({error: 'Id is not provided'}, {status: 400});
    }

    const participantId = Number(id);

    // Fetch only required fields
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        active: true,
        approved: true,
        visibility: true,
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            State: true,
            Country: true,
            CountryCode: true,
          },
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, {status: 404});
    }

    return NextResponse.json({data: participant}, {status: 200});

  } catch (error: any) {
    console.error("Error fetching participant profile:", error);
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}
