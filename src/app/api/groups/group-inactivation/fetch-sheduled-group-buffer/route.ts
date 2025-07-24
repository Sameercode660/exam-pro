import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";


export async function GET() {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const groupsExpiringSoon = await prisma.scheduledGroupBuffer.findMany({
      where: {
        endDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
    });

    const groupIds = groupsExpiringSoon.map((group: {groupId: number}) => group.groupId) 

    if(groupIds.length > 0) {
      await prisma.scheduledGroupBuffer.updateMany({
        where: {
          id: {in: groupIds}
        }, 
        data: {
          processed: true
        }
      })
    }

    return NextResponse.json({
      message: "Groups expiring within 7 days fetched successfully",
      data: groupsExpiringSoon,
    });
  } catch (error) {
    console.error("[GROUP_EXPIRING_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while fetching groups" },
      { status: 500 }
    );
  }
}
