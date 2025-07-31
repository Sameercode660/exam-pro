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
        const { categoryId, adminId } = await req.json();
        if (!categoryId || !adminId) {
            return server_1.NextResponse.json({ error: "Category ID and Admin ID are required" }, { status: 400 });
        }
        console.log(categoryId, adminId);
        const topics = await prisma_1.default.topic.findMany({
            where: {
                adminId,
                categoryId
            },
            select: {
                id: true,
                name: true,
                adminId: true,
                categoryId: true,
            },
        });
        console.log(topics);
        return server_1.NextResponse.json(topics, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching topics:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
    }
}
