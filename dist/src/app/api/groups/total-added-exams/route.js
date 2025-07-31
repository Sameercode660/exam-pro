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
        const totalAddedExams = await prisma_1.default.groupExam.count({
            where: {
                groupId,
                visibility: true, // assuming soft delete is handled by 'visibility' flag
            },
        });
        return server_1.NextResponse.json({ total: totalAddedExams });
    }
    catch (err) {
        console.error("FetchTotalAddedExams Error:", err);
        return server_1.NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
