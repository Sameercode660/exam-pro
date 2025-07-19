import { NextResponse } from "next/server";
import { qstash } from "@/utils/qstash";

export async function POST(req: Request) {
  try {
    const { examId, startTime, endTime } = await req.json();

    console.log("StartTime:", startTime);
    console.log("EndTime:", endTime);

    const startTimeMs = new Date(startTime).getTime();
    const endTimeMs = new Date(endTime).getTime();
    const now = Date.now();

    if (!startTime || isNaN(startTimeMs)) {
      return NextResponse.json({ error: "Invalid startTime" }, { status: 400 });
    }

    if (!endTime || isNaN(endTimeMs)) {
      return NextResponse.json({ error: "Invalid endTime" }, { status: 400 });
    }

    const delayToStart = Math.floor((startTimeMs - now) / 1000); // Convert ms to seconds
    const delayToEnd = Math.floor((endTimeMs - now) / 1000);     // Convert ms to seconds

    // Check QStash limit (max 7 days)
    const MAX_QSTASH_DELAY = 604800; // 7 days in seconds

    if (delayToStart > MAX_QSTASH_DELAY) {
      return NextResponse.json({ error: "Start time exceeds 7 day limit." }, { status: 400 });
    }

    if (delayToEnd > MAX_QSTASH_DELAY) {
      return NextResponse.json({ error: "End time exceeds 7 day limit." }, { status: 400 });
    }

    // Activate Exam at startTime
    await qstash.publish({
      url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/participants/my-group/exam/activate-exam`,
      body: JSON.stringify({ examId }),
      delay: Math.max(delayToStart, 0),
    });

    // Complete Exam at endTime
    await qstash.publish({
      url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/participants/my-group/exam/complete-exam`,
      body: JSON.stringify({ examId }),
      delay: Math.max(delayToEnd, 0),
    });

    return NextResponse.json({
      message: "Exam activation and completion scheduled successfully.",
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
