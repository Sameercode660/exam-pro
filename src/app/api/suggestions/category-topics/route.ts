
import { NextResponse } from "next/server";
import prisma from "@/utils/prisma"; 

type RequestTypes = {
  organizationId: number;
} 


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizationId }: Partial<RequestTypes> = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Fetch all categories + their topics for that org
    const categories = await prisma.category.findMany({
      where: {
        admin: {
          organizationId: Number(organizationId),
        },
      },
      include: {
        topics: true,
      },
    });

    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/categories-topics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
