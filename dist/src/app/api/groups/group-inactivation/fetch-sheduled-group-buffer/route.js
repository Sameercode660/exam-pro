"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function GET() {
    try {
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);
        const groupsExpiringSoon = await prisma_1.default.scheduledGroupBuffer.findMany({
            where: {
                endDate: {
                    gte: now,
                    lte: sevenDaysFromNow,
                },
            },
        });
        const groupIds = groupsExpiringSoon.map((group) => group.groupId);
        if (groupIds.length > 0) {
            await prisma_1.default.scheduledGroupBuffer.updateMany({
                where: {
                    id: { in: groupIds }
                },
                data: {
                    processed: true
                }
            });
        }
        return server_1.NextResponse.json({
            message: "Groups expiring within 7 days fetched successfully",
            data: groupsExpiringSoon,
        });
    }
    catch (error) {
        console.error("[GROUP_EXPIRING_FETCH_ERROR]", error);
        return server_1.NextResponse.json({ error: "Something went wrong while fetching groups" }, { status: 500 });
    }
}
