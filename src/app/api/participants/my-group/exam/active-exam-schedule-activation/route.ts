import { NextResponse } from "next/server";
import { qstash } from "@/utils/qstash";

type RequestTypes = {
  examId: number;
  endTime: string;
}

export async function POST(req: Request) {
  try {
    const { examId, endTime }: RequestTypes = await req.json();

    console.log("EndTime:", endTime);

    const endTimeMs = new Date(endTime).getTime();
    const now = Date.now();

    if (!endTime || isNaN(endTimeMs)) {
      return NextResponse.json({ error: "Invalid endTime" }, { status: 400 });
    }

    const delayToEnd = Math.floor((endTimeMs - now) / 1000); // Convert ms to seconds

    // QStash max delay limit (7 days)
    const MAX_QSTASH_DELAY = 604800; // 7 * 24 * 60 * 60 seconds

    if (delayToEnd > MAX_QSTASH_DELAY) {
      return NextResponse.json({ error: "End time exceeds 7 day limit." }, { status: 400 });
    }

    // Schedule Complete Exam
    await qstash.publish({
      url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/participants/my-group/exam/complete-exam`,
      body: JSON.stringify({ examId }),
      delay: Math.max(delayToEnd, 0),
    });

    return NextResponse.json({
      message: "Exam completion scheduled successfully.",
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
