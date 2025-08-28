import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number;
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId }: Partial<RequestTypes> = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    const categories = await prisma.category.findMany({
      where: {
        admin: {
          organizationId
        }
      },
      select: {
        id: true,
        name: true,
        adminId: true,
      },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
