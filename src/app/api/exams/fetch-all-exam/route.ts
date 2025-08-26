import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";
import { partial } from "zod/v4/core/util.cjs";

type DateRangeFilter = {
  from?: string | Date;
  to?: string | Date;
};

export interface FetchExamsRequest {
  adminId?: number; // logged-in admin making request
  search?: string; // title/description
  examCode?: string; // partial exam code
  status?: "Scheduled" | "Active" | "Inactive" | "Completed"; // restrict to valid values
  dateRange?: DateRangeFilter; // date range filter
  createdByAdminId?: number; // filter by specific admin
}

export async function POST(req: NextRequest) {
  try {
    const {
      adminId,
      search,
      examCode,
      status,
      dateRange,
      createdByAdminId,
    }: Partial<FetchExamsRequest> = await req.json();

    const filters: any = {
      visibility: true,
    };

    if (adminId) {
      filters.createdByAdminId = adminId;
    }

    if (createdByAdminId) {
      filters.createdByAdminId = createdByAdminId;
    }

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (examCode) {
      filters.examCode = { contains: examCode, mode: "insensitive" };
    }

    if (status) {
      filters.status = status;
    }

    if (dateRange?.from && dateRange?.to) {
      filters.startTime = { gte: new Date(dateRange.from) };
      filters.endTime = { lte: new Date(dateRange.to) };
    }

    const exams = await prisma.exam.findMany({
      where: filters,
      include: {
        createdBy: true,
        updatedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Exams fetched successfully",
      response: exams,
      status: true,
    });
  } catch (error: unknown) {
    console.error("Error in fetch exams:", error);

    return NextResponse.json({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Unexpected error",
      status: false,
    });
  }
}
