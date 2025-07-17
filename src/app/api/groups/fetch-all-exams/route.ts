import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { organizationId, adminId, filter, search } = await req.json();

    if (!organizationId || !adminId || !filter) {
      return NextResponse.json(
        { error: "organizationId, adminId, and filter are required." },
        { status: 400 }
      );
    }

    let exams;

    if (filter === "all") {
      const admins = await prisma.user.findMany({
        where: { organizationId },
        select: { id: true, name: true },
      });

      const adminMap = Object.fromEntries(admins.map((admin) => [admin.id, admin.name]));
      const adminIds = admins.map((admin) => admin.id);

      const whereClause = search
        ? {
            OR: [
              {
                createdByAdminId: { in: adminIds },
                title: { contains: search, mode: "insensitive" as const },
              },
              {
                createdByAdminId: { in: adminIds },
                description: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {
            createdByAdminId: { in: adminIds },
          };

      exams = await prisma.exam.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          createdByAdminId: true,
        },
        orderBy: { createdAt: "desc" },
      });

      exams = exams.map((exam) => ({
        ...exam,
        createdBy: adminMap[exam.createdByAdminId] || "Unknown",
      }));

    } else if (filter === "my") {
      const whereClause = search
        ? {
            OR: [
              {
                createdByAdminId: adminId,
                title: { contains: search, mode: "insensitive" as const },
              },
              {
                createdByAdminId: adminId,
                description: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {
            createdByAdminId: adminId,
          };

      exams = await prisma.exam.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      exams = exams.map((exam) => ({
        ...exam,
        createdBy: "Me",
      }));

    } else {
      return NextResponse.json({ error: "Invalid filter." }, { status: 400 });
    }

    return NextResponse.json({ exams });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
