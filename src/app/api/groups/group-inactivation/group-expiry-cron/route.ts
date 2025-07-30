import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { qstash } from "@/utils/qstash";

type RequestTypes = {
  groupId: number;
  endDate: string
}

export async function POST(req: Request) {
  try {
    const { groupId, endDate }: Partial<RequestTypes> = await req.json();

    if (!groupId || !endDate) {
      return NextResponse.json({ error: "Missing groupId or endDate" }, { status: 400 });
    }

    const now = new Date();
    const endTime = new Date(endDate);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const delayInSeconds = Math.floor((endTime.getTime() - now.getTime()) / 1000);
    const MAX_QSTASH_DELAY = 604800; // 7 days in seconds

    if (endTime > sevenDaysFromNow) {
      // Store in buffer table for later processing
      await prisma.scheduledGroupBuffer.upsert({
        where: { groupId },
        update: {
          endDate: endTime,
          processed: false,
        },
        create: {
          groupId,
          endDate: endTime,
        },
      });

      return NextResponse.json({
        message: "Group endTime exceeds 7-day limit. Added to buffer for later scheduling.",
        status: "buffered",
      });
    }

    // Schedule group expiration via qstash
    await qstash.publish({
      url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/group/group-inactivation/inactivate-group`,
      body: JSON.stringify({ groupId }),
      delay: Math.max(delayInSeconds, 0),
    });

    return NextResponse.json({
      message: "Group expiration scheduled via QStash.",
      status: "scheduled",
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
