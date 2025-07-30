import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  name: string;
  description: string;
  endDate: string;
  createdById: number;
  organizationId: number;
};

export async function POST(req: NextRequest) {
  try {
    const body: RequestTypes = await req.json();

    const { name, description, endDate, createdById, organizationId } = body;

    console.log(name, description, createdById, endDate, organizationId);

    if (!name || !endDate || !createdById || !organizationId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, endDate, createdById, or organizationId.",
        },
        { status: 400 }
      );
    }

    const duplicateCheck = await prisma.group.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        organizationId: organizationId,
        createdById: createdById,
      },
    });

    if (duplicateCheck) {
      return NextResponse.json(
        { error: "Group Already exists" },
        { status: 400 }
      );
    }

    const start = new Date();
    const end = new Date(endDate);

    if (isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid endDate format." },
        { status: 400 }
      );
    }
    if (start > end) {
      return NextResponse.json(
        { error: "startDate must be before endDate." },
        { status: 400 }
      );
    }

    const creator = await prisma.user.findUnique({
      where: { id: createdById },
    });
    if (!creator) {
      return NextResponse.json(
        { error: "CreatedBy user not found." },
        { status: 404 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found." },
        { status: 404 }
      );
    }

    const newGroup = await prisma.group.create({
      data: {
        name,
        description,
        startDate: start,
        endDate: end,
        createdById,
        organizationId,
      },
    });

    return NextResponse.json(
      { message: "Group created successfully", group: newGroup },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
