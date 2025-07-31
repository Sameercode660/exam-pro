"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
const qstash_1 = require("@/utils/qstash");
async function POST(req) {
    try {
        const { examId, startTime, endTime } = await req.json();
        if (!examId || !startTime || !endTime) {
            return server_1.NextResponse.json({ error: 'Anyone input field is empty' }, { status: 400 });
        }
        const startTimeMs = new Date(startTime).getTime();
        const endTimeMs = new Date(endTime).getTime();
        const now = Date.now();
        if (!startTime || isNaN(startTimeMs)) {
            return server_1.NextResponse.json({ error: "Invalid startTime" }, { status: 400 });
        }
        if (!endTime || isNaN(endTimeMs)) {
            return server_1.NextResponse.json({ error: "Invalid endTime" }, { status: 400 });
        }
        const delayToStart = Math.floor((startTimeMs - now) / 1000);
        const delayToEnd = Math.floor((endTimeMs - now) / 1000);
        const MAX_QSTASH_DELAY = 604800; // 7 days in seconds
        // If exceeds 7-day limit, store in buffer
        if (delayToStart > MAX_QSTASH_DELAY || delayToEnd > MAX_QSTASH_DELAY) {
            await prisma_1.default.scheduledExamBuffer.upsert({
                where: { examId },
                update: {
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    processed: false,
                },
                create: {
                    examId,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                },
            });
            return server_1.NextResponse.json({
                message: "Exam exceeds added to buffer for later processing.",
                status: "buffered",
            });
        }
        // Activate Exam at startTime
        await qstash_1.qstash.publish({
            url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/participants/my-group/exam/activate-exam`,
            body: JSON.stringify({ examId }),
            delay: Math.max(delayToStart, 0),
        });
        // Complete Exam at endTime
        await qstash_1.qstash.publish({
            url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/participants/my-group/exam/complete-exam`,
            body: JSON.stringify({ examId }),
            delay: Math.max(delayToEnd, 0),
        });
        return server_1.NextResponse.json({
            message: "Exam activation and completion scheduled successfully.",
            status: "scheduled",
        });
    }
    catch (err) {
        console.error(err);
        return server_1.NextResponse.json({ error: err.message }, { status: 500 });
    }
}
