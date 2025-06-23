import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { adminId } = await req.json();

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    const categories = await prisma.category.findMany({
      where: { adminId: parseInt(adminId) },
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
