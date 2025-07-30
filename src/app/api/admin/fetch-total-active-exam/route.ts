import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number;
  search: string;
}

export async function POST(request: NextRequest) {
  const { organizationId, search = "" }: Partial<RequestTypes> = await request.json();

  const activeExams = await prisma.exam.findMany({
    where: {
      createdBy: {
        organizationId
      },
      status: 'Active',
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

  return NextResponse.json({ data: activeExams });
}
