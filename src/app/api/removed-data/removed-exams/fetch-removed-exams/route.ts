import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number;
  search?: string;
  examCode?: string;
  status?: string;
  createdByAdminId?: number;
  dateRange?: { from: string; to: string };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      organizationId,
      search,
      examCode,
      status,
      createdByAdminId,
      dateRange,
    }: Partial<RequestTypes> = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const removedExams = await prisma.exam.findMany({
      where: {
        visibility: false,
        createdBy: {
          organizationId: Number(organizationId),
          ...(createdByAdminId ? { id: Number(createdByAdminId) } : {}),
        },
        ...(search
          ? {
              title: { contains: search, mode: "insensitive" },
            }
          : {}),
        ...(examCode ? { examCode: { contains: examCode, mode: "insensitive" } } : {}),
        ...(status ? { status } : {}),
        ...(dateRange?.from && dateRange?.to
          ? {
              updatedAt: {
                gte: new Date(dateRange.from),
                lte: new Date(dateRange.to),
              },
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        examCode: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: { name: true },
        },
        updatedBy: {
          select: { name: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const formatted = removedExams.map((exam) => ({
      id: exam.id,
      name: exam.title,
      examCode: exam.examCode,
      status: exam.status,
      description: exam.description,
      duration: exam.duration,
      createdBy: exam.createdBy?.name || "-",
      removedBy: exam.updatedBy?.name || "-",
      createdAt: exam.createdAt,
      removedAt: exam.updatedAt,
    }));

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch removed exams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
