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
        const { groupId, endDate } = await req.json();
        if (!groupId || !endDate) {
            return server_1.NextResponse.json({ error: "Missing groupId or endDate" }, { status: 400 });
        }
        const now = new Date();
        const endTime = new Date(endDate);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);
        const delayInSeconds = Math.floor((endTime.getTime() - now.getTime()) / 1000);
        const MAX_QSTASH_DELAY = 604800; // 7 days in seconds
        if (endTime > sevenDaysFromNow) {
            // Store in buffer table for later processing
            await prisma_1.default.scheduledGroupBuffer.upsert({
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
            return server_1.NextResponse.json({
                message: "Group endTime exceeds 7-day limit. Added to buffer for later scheduling.",
                status: "buffered",
            });
        }
        // Schedule group expiration via qstash
        await qstash_1.qstash.publish({
            url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/group/group-inactivation/inactivate-group`,
            body: JSON.stringify({ groupId }),
            delay: Math.max(delayInSeconds, 0),
        });
        return server_1.NextResponse.json({
            message: "Group expiration scheduled via QStash.",
            status: "scheduled",
        });
    }
    catch (err) {
        console.error(err);
        return server_1.NextResponse.json({ error: err.message }, { status: 500 });
    }
}
