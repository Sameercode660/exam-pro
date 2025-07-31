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
        const organizations = await prisma_1.default.organization.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        });
        return server_1.NextResponse.json({ organizations });
    }
    catch (err) {
        console.error("Error fetching organizations:", err);
        return server_1.NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
