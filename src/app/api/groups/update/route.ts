import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  groupId: number;
  adminId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const {
      groupId,
      adminId,
      name,
      description,
      startDate,
      endDate,
      isActive,
    }: Partial<RequestTypes> = await req.json();

    // Validation
    if (!groupId || typeof groupId !== "number") {
      return NextResponse.json(
        { error: "Invalid or missing groupId" },
        { status: 400 }
      );
    }

    if (!adminId || typeof adminId !== "number") {
      return NextResponse.json(
        { error: "Invalid or missing adminId" },
        { status: 400 }
      );
    }

    // date validation 
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalizing to midnight for comparison


    if (start && end && end < start) {
      return NextResponse.json(
        { error: "End date cannot be earlier than start date" },
        { status: 400 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    const adminInfo = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
    });

    if (group.createdById !== adminId || adminInfo?.role !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized: You are not the creator of this group" },
        { status: 403 }
      );
    }

    // Build update payload
    const updateData: any = {isActive: true};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    // if (typeof isActive === "boolean") updateData.isActive = isActive;?

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
