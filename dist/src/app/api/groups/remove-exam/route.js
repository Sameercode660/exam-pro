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
        const { groupExamId } = await req.json();
        if (!groupExamId) {
            return server_1.NextResponse.json({ error: "groupExamId is required." }, { status: 400 });
        }
        const existing = await prisma_1.default.groupExam.findUnique({
            where: { id: groupExamId },
        });
        if (!existing) {
            return server_1.NextResponse.json({ error: "GroupExam not found." }, { status: 404 });
        }
        await prisma_1.default.groupExam.update({
            where: { id: groupExamId },
            data: { visibility: false },
        });
        return server_1.NextResponse.json({ message: "Exam removed from group successfully.", success: true });
    }
    catch (err) {
        console.error("RemoveFromGroup Error:", err);
        return server_1.NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
