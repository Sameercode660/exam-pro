"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const qstash_1 = require("@/utils/qstash");
async function POST(req) {
    try {
        const { examId, endTime } = await req.json();
        console.log("EndTime:", endTime);
        if (!examId || !endTime) {
            return server_1.NextResponse.json({ error: 'examId or endTime is missing', status: 400 });
        }
        const endTimeMs = new Date(endTime).getTime();
        const now = Date.now();
        if (!endTime || isNaN(endTimeMs)) {
            return server_1.NextResponse.json({ error: "Invalid endTime" }, { status: 400 });
        }
        const delayToEnd = Math.floor((endTimeMs - now) / 1000); // Convert ms to seconds
        // QStash max delay limit (7 days)
        const MAX_QSTASH_DELAY = 604800; // 7 * 24 * 60 * 60 seconds
        if (delayToEnd > MAX_QSTASH_DELAY) {
            return server_1.NextResponse.json({ error: "End time exceeds 7 day limit." }, { status: 400 });
        }
        // Schedule Complete Exam
        await qstash_1.qstash.publish({
            url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/participants/my-group/exam/complete-exam`,
            body: JSON.stringify({ examId }),
            delay: Math.max(delayToEnd, 0),
        });
        return server_1.NextResponse.json({
            message: "Exam completion scheduled successfully.",
        });
    }
    catch (err) {
        console.error(err);
        return server_1.NextResponse.json({ error: err.message }, { status: 500 });
    }
}
