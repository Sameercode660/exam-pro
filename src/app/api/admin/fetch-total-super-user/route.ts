import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number;
  search: string;
}

export async function POST(request: NextRequest) {
  const { organizationId, search = "" }: Partial<RequestTypes> = await request.json();

  const superUsers = await prisma.user.findMany({
    where: {
      organizationId,
      role: "SuperUser",
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobileNumber: true,
      createdAt: true,
      createdBy: {
        select: {
          name: true
        }
      }
    },
  });

  return NextResponse.json({ data: superUsers });
}
