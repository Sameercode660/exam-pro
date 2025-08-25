import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number;
  search?: string;
  adminId?: number; // filter by remover or creator
  dateRange?: { from: string; to: string };
};

export async function POST(req: NextRequest) {
  try {
    const { organizationId, search, adminId, dateRange }: Partial<RequestTypes> = await req.json();

    if (!organizationId) {
      return NextResponse.json({ success: false, message: "OrganizationId is required" }, { status: 400 });
    }

    const removedGroups = await prisma.group.findMany({
      where: {
        visibility: false,
        organizationId,
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
        ...(adminId && {
          OR: [
            { createdById: adminId },
            { updatedById: adminId },
          ],
        }),
        ...(dateRange?.from &&
          dateRange?.to && {
            updatedAt: {
              gte: new Date(dateRange.from),
              lte: new Date(dateRange.to),
            },
          }),
      },
      include: {
        createdBy: { select: { name: true } },
        updatedBy: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = removedGroups.map((group) => ({
      id: group.id,
      name: group.name,
      createdAt: group.createdAt,
      removedAt: group.updatedAt,
      createdBy: group.createdBy?.name || "-",
      removedBy: group.updatedBy?.name || "-",
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching removed groups:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
