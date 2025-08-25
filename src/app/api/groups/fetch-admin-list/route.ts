import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number;
};

export async function POST(req: NextRequest) {
  try {
    const { organizationId }: Partial<RequestTypes> = await req.json();

    if (!organizationId || typeof organizationId !== "number") {
      return NextResponse.json(
        { error: "Invalid or missing organizationId" },
        { status: 400 }
      );
    }

    const admins = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        { error: "No admins found for this organization" },
        { status: 404 }
      );
    }

    return NextResponse.json({ admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
