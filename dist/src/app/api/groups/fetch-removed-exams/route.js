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
            return server_1.NextResponse.json({ error: "groupId is required." }, { status: 400 });
        }
        const removedExams = await prisma_1.default.groupExam.findMany({
            where: {
                groupId,
                visibility: false,
            },
            include: {
                exam: true,
                group: true,
                admin: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                assignedAt: 'desc',
            },
        });
        return server_1.NextResponse.json({ removedExams });
    }
    catch (err) {
        console.error("FetchRemovedExams Error:", err);
        return server_1.NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
