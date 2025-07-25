import { NextRequest, NextResponse} from "next/server";
import prisma from "@/utils/prisma";


export async function POST(request: NextRequest) {
  const { organizationId, search = "" } = await request.json();

  const inactiveExams = await prisma.exam.findMany({
    where: {
      createdBy: {
        organizationId
      },
      status: 'Inactive',
      title: {
        contains: search,
        mode: "insensitive",
      },
    },
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ data: inactiveExams });
}