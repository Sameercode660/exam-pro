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
        const { adminId } = await req.json();
        if (!adminId) {
            return server_1.NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
        }
        const categories = await prisma_1.default.category.findMany({
            where: { adminId },
            select: {
                id: true,
                name: true,
                adminId: true,
            },
        });
        return server_1.NextResponse.json(categories, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}
