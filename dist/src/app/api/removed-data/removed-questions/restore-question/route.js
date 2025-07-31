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
        const { questionId, adminId } = await req.json();
        const question = await prisma_1.default.question.update({
            where: {
                id: questionId,
            },
            data: {
                visibility: true,
                updatedBy: adminId,
            },
        });
        return server_1.NextResponse.json({ success: true, message: "Question restored successfully", data: question });
    }
    catch (error) {
        console.error("Error restoring question:", error);
        return server_1.NextResponse.json({ success: false, message: "Failed to restore question" }, { status: 500 });
    }
}
