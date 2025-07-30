
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  groupId: number;
  adminId: number;
}

export async function POST(req: NextRequest) {
  try {
    const { groupId, adminId }: RequestTypes = await req.json();

    const restored = await prisma.group.update({
      where: { id: groupId },
      data: {
        visibility: true,
        updatedById: adminId,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: restored });
  } catch (error) {
    console.error("Error restoring group:", error);
    return NextResponse.json(
      { success: false, message: "Restore failed" },
      { status: 500 }
    );
  }
}
