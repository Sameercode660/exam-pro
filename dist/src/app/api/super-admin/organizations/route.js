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
        const organizations = await prisma_1.default.organization.findMany({
            where: searchWords.length
                ? {
                    OR: searchWords.map(word => ({
                        OR: [
                            { name: { contains: word, mode: 'insensitive' } },
                            { email: { contains: word, mode: 'insensitive' } },
                            { phone: { contains: word, mode: 'insensitive' } },
                            { address: { contains: word, mode: 'insensitive' } },
                            { State: { contains: word, mode: 'insensitive' } },
                            { Country: { contains: word, mode: 'insensitive' } },
                        ],
                    })),
                }
                : undefined, // fetch all
            orderBy: {
                createdAt: 'desc',
            },
        });
        return server_1.NextResponse.json(organizations);
    }
    catch (error) {
        console.error('Error fetching organizations:', error);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
