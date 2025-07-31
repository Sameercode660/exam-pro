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
        const addedExams = await prisma_1.default.groupExam.findMany({
            where: {
                groupId,
                visibility: true,
                exam: {
                    visibility: true
                }
            },
            include: {
                exam: true,
            },
        });
        return server_1.NextResponse.json({ addedExams });
    }
    catch (err) {
        console.error("FetchAddedExams Error:", err);
        return server_1.NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
