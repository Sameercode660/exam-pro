import { NextRequest, NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number;
  search: string;
  fromDate: string;
  toDate: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    search = "",
    fromDate,
    toDate,
    organizationId,
  }: Partial<RequestTypes> = body;

  try {
    const userActivities = await prisma.adminsTracking.findMany({
      where: {
        admin: {
          organizationId,
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        loginTime: {
          gte: fromDate ? new Date(startOfDay(new Date(fromDate))) : undefined,
          lte: toDate ? new Date(endOfDay(new Date(toDate))) : undefined,
        },
      },
      include: {
        admin: true,
      },
      orderBy: {
        loginTime: "desc",
      },
    });

    return NextResponse.json({ data: userActivities });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user activities" },
      { status: 500 }
    );
  }
}
