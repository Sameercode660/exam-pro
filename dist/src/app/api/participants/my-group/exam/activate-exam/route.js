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
        const { examId } = await req.json();
        await prisma_1.default.exam.update({
            where: { id: examId },
            data: { status: "Active" },
        });
        return server_1.NextResponse.json({ message: "Exam activated" });
    }
    catch (err) {
        return server_1.NextResponse.json({ error: err.message }, { status: 500 });
    }
}
