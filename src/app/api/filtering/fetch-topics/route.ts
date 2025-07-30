import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  categoryId: number;
  adminId: number;
}

export async function POST(req: NextRequest) {
  try {
    const { categoryId, adminId }: Partial<RequestTypes> = await req.json();

    if (!categoryId || !adminId) {
      return NextResponse.json({ error: "Category ID and Admin ID are required" }, { status: 400 });
    }

    console.log(categoryId, adminId)

    const topics = await prisma.topic.findMany({
      where: {
          adminId, 
          categoryId
      },
      select: {
        id: true,
        name: true,
        adminId: true,
        categoryId: true,
      },
    });
    console.log(topics)

    return NextResponse.json(topics, { status: 200 });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}
