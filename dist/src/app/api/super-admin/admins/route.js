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
        const { search } = await req.json();
        const searchWords = search
            ? search.split(' ').filter(Boolean)
            : [];
        // Construct OR condition manually to avoid type conflict
        const orConditions = [];
        for (const word of searchWords) {
            orConditions.push({ name: { contains: word, mode: 'insensitive' } }, { email: { contains: word, mode: 'insensitive' } }, { mobileNumber: { contains: word, mode: 'insensitive' } });
        }
        const admins = await prisma_1.default.user.findMany({
            where: {
                role: 'Admin',
                ...(orConditions.length > 0 && { OR: orConditions }),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return server_1.NextResponse.json(admins);
    }
    catch (error) {
        console.error('Error fetching admins:', error);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
