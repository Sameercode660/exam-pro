import { NextRequest, NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import prisma from "@/utils/prisma";

type RequestTypes = {
  organizationId: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
  adminId?: number;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    search,
    fromDate,
    toDate,
    organizationId,
    adminId,
  }: Partial<RequestTypes> = body;

  try {
    const userActivities = await prisma.participantTracking.findMany({
      where: {
        participant: {
          organizationId,
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { mobileNumber: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(adminId
            ? {
                createdById: Number(adminId),  
              }
            : {}),
        },
        loginTime: {
          gte: fromDate ? new Date(startOfDay(new Date(fromDate))) : undefined,
          lte: toDate ? new Date(endOfDay(new Date(toDate))) : undefined,
        },
      },
      include: {
        participant: {
          include: {
            createdBy: true, // 👈 so you can also return admin info if needed
          },
        },
      },
    });

    return NextResponse.json({ data: userActivities });
  } catch (error) {
    console.error("[FETCH_ACTIVITY_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch user activities" },
      { status: 500 }
    );
  }
}
