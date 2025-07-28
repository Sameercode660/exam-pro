import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(request: NextRequest) {
  try {
    const { organizationId, search } = await request.json();

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const participants = await prisma.participant.findMany({
      where: {
        visibility: false,
        organizationId,
        ...(search && {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              mobileNumber: {
                contains: search,
              },
            },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        updatedBy: {
          select: {
            name: true,
          },
        },
        updatedAt: true
      },
    });

    const result = participants.map((p) => ({
      id: p.id,
      name: p.name,
      mobileNumber: p.mobileNumber,
      createdAt: p.createdAt,
      removedAt: p.updatedAt,
      createdBy: p.createdBy?.name ?? "self",
      removedBy: p.updatedBy?.name ?? null,

    }));

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("Error fetching participants:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
