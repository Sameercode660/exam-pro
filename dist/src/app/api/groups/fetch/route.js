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
        const { adminId, organizationId, search } = await req.json();
        if (!adminId && !organizationId) {
            return server_1.NextResponse.json({ error: 'adminId or organizationId is required.' }, { status: 400 });
        }
        // Build base where clause
        const whereClause = {
            visibility: true,
        };
        if (adminId) {
            whereClause.createdById = adminId;
        }
        else if (organizationId) {
            whereClause.organizationId = organizationId;
        }
        // Search  (multiword search)
        if (search?.trim()) {
            const terms = search.trim().split(/\s+/);
            whereClause.OR = terms.flatMap((term) => [
                { name: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
                {
                    createdBy: {
                        name: { contains: term, mode: 'insensitive' }
                    }
                }
            ]);
        }
        const groups = await prisma_1.default.group.findMany({
            where: whereClause,
            include: {
                createdBy: { select: { name: true, id: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return server_1.NextResponse.json(groups);
    }
    catch (error) {
        console.error('Error fetching groups:', error);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
