"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function POST(req) {
    try {
        const { groupId } = await req.json();
        if (!groupId) {
            return server_1.NextResponse.json({ error: "groupId is required" }, { status: 400 });
        }
        const participants = await prisma_1.default.groupParticipant.findMany({
            where: {
                groupId,
                isActive: true,
                visibility: true,
                user: {
                    visibility: true
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        mobileNumber: true,
                        approved: true,
                    },
                },
            },
        });
        return server_1.NextResponse.json({ participants }, { status: 200 });
    }
    catch (error) {
        console.error("[FETCH_GROUP_PARTICIPANTS]", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
