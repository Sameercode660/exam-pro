
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId }: RequestTypes = await req.json();

    const removedGroups = await prisma.group.findMany({
      where: {
        visibility: false,
        organizationId,
      },
      include: {
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
      },
    });

    const formatted = removedGroups.map((group) => ({
      id: group.id,
      name: group.name,
      createdAt: group.createdAt,
      removedAt: group.updatedAt,
      createdBy: group.createdBy?.name || "-",
      removedBy: group.updatedBy?.name || "-",
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching removed groups:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
