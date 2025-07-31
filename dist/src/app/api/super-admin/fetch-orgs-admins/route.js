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
        const searchWords = search?.split(' ').filter(Boolean) || [];
        const orConditions = searchWords.map((word) => ({
            OR: [
                { name: { contains: word, mode: 'insensitive' } },
                { email: { contains: word, mode: 'insensitive' } },
                { mobileNumber: { contains: word, mode: 'insensitive' } },
                { Organization: { name: { contains: word, mode: 'insensitive' } } },
            ],
        }));
        const whereClause = {
            role: 'Admin',
            ...(orConditions.length > 0 && { AND: orConditions }),
        };
        const admins = await prisma_1.default.user.findMany({
            where: whereClause,
            include: {
                Organization: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return server_1.NextResponse.json(admins);
    }
    catch (error) {
        if (error instanceof Error) {
            return server_1.NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error('Error fetching admins with organization:', error);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
