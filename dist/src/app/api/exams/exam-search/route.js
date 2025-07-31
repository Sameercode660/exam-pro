"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function POST(request) {
    try {
        const body = await request.json();
        const { query } = body;
        if (!query || typeof query !== 'string') {
            return server_1.NextResponse.json({ message: 'Query parameter is required.' }, { status: 400 });
        }
        const words = query.split(' ');
        const results = await prisma_1.default.exam.findMany({
            where: {
                OR: words.map((word) => ({
                    OR: [
                        { title: { contains: word, mode: 'insensitive' } },
                        { description: { contains: word, mode: 'insensitive' } },
                    ],
                })),
                visibility: true
            },
            include: {
                createdBy: true,
                updatedBy: true
            }
        });
        return server_1.NextResponse.json({ results }, { status: 200 });
    }
    catch (err) {
        console.error('Search API Error:', err);
        return server_1.NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
