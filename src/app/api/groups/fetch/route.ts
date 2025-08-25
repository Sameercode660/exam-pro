import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  adminId?: number;
  organizationId?: number;
  search?: string;
  status?: "active" | "inactive"; // new
  fromDate?: string; // new
  toDate?: string; // new
};

export async function POST(req: NextRequest) {
  try {
    const { adminId, organizationId, search, status, fromDate, toDate }: RequestTypes =
      await req.json();

    if (!adminId && !organizationId) {
      return NextResponse.json(
        { error: "adminId or organizationId is required." },
        { status: 400 }
      );
    }

    // Build base where clause
    const whereClause: any = {
      visibility: true,
    };

    if (adminId) {
      whereClause.createdById = adminId;
    } else if (organizationId) {
      whereClause.organizationId = organizationId;
    }

    // Update expired groups before fetching
    const now = new Date();
    await prisma.group.updateMany({
      where: {
        endDate: { lt: now },
        isActive: true,
      },
      data: { isActive: false },
    });

    // Status filter
    if (status) {
      whereClause.isActive = status === "active";
    }

    // Date range filter
    if (fromDate || toDate) {
      whereClause.startDate = {};
      if (fromDate) whereClause.startDate.gte = new Date(fromDate);
      if (toDate) whereClause.startDate.lte = new Date(toDate);
    }

    // Search filter
    if (search?.trim()) {
      const terms = search.trim().split(/\s+/);
      whereClause.OR = terms.flatMap((term: string) => [
        { name: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { createdBy: { name: { contains: term, mode: "insensitive" } } },
      ]);
    }

    // Fetch groups
    const groups = await prisma.group.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { name: true, id: true } },
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
