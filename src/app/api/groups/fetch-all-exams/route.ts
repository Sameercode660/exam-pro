import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number;
  adminId: number;
  filter: string;
  search: string;
  groupId: number;
};

export async function POST(req: Request) {
  try {
    const { organizationId, adminId, filter, search, groupId }: Partial<RequestTypes> =
      await req.json();

    if (!organizationId || !adminId || !filter || !groupId) {
      return NextResponse.json(
        { error: "organizationId, adminId, groupId, and filter are required." },
        { status: 400 }
      );
    }

    let exams;

    if (filter === "all") {
      const admins = await prisma.user.findMany({
        where: { organizationId },
        select: { id: true, name: true },
      });

      const adminMap = Object.fromEntries(
        admins.map((admin) => [admin.id, admin.name])
      );
      const adminIds = admins.map((admin) => admin.id);

      const whereClause: any = {
        createdByAdminId: { in: adminIds },
        visibility: true,
      };

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ];
      }

      const rawExams = await prisma.exam.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          createdByAdminId: true,
          GroupExam: {
            where: { groupId },
            select: {
              id: true,
              visibility: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      exams = rawExams.map((exam) => {
        const groupExam = exam.GroupExam[0]; // Only one possible per group
        let status = "not_added";

        if (groupExam) {
          status = groupExam.visibility ? "added" : "removed";
        }

        return {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          createdAt: exam.createdAt,
          createdBy: adminMap[exam.createdByAdminId] || "Unknown",
          status,
        };
      });
    } else if (filter === "my") {
      const whereClause: any = {
        createdByAdminId: adminId,
        visibility: true,
      };

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ];
      }

      const rawExams = await prisma.exam.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          GroupExam: {
            where: { groupId },
            select: {
              id: true,
              visibility: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      exams = rawExams.map((exam) => {
        const groupExam = exam.GroupExam[0];
        let status = "not_added";

        if (groupExam) {
          status = groupExam.visibility ? "added" : "removed";
        }

        return {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          createdAt: exam.createdAt,
          createdBy: "Me",
          status,
        };
      });
    } else {
      return NextResponse.json({ error: "Invalid filter." }, { status: 400 });
    }

    return NextResponse.json({ exams });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
