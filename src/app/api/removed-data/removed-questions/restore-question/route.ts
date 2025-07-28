import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
  try {
    const { questionId, adminId } = await req.json();

    const question = await prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        visibility: true,
        updatedBy: adminId,
      },
    });

    return NextResponse.json({ success: true, message: "Question restored successfully", data: question });
  } catch (error) {
    console.error("Error restoring question:", error);
    return NextResponse.json({ success: false, message: "Failed to restore question" }, { status: 500 });
  }
}
