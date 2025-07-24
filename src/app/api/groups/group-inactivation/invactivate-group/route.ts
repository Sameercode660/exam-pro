import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { groupId } = await req.json();

    await prisma.group.update({
      where: { id: groupId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "group inactivate" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}