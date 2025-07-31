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
        const { search, filter, organizationId, adminId } = await req.json();
        console.log(search, filter, organizationId, adminId);
        if (!organizationId) {
            return server_1.NextResponse.json({ error: "organizationId is required." }, { status: 400 });
        }
        if (filter !== "all" && filter !== "my") {
            return server_1.NextResponse.json({ error: "Invalid filter type." }, { status: 400 });
        }
        const searchWords = search ? search.trim().split(/\s+/) : [];
        // Build where clause
        const whereClause = {
            organizationId,
            visibility: true,
            approved: true
        };
        if (filter === "my") {
            if (!adminId) {
                return server_1.NextResponse.json({ error: "adminId is required for 'my' filter." }, { status: 400 });
            }
            whereClause.createdById = adminId;
        }
        if (searchWords.length > 0) {
            whereClause.AND = searchWords.map((word) => ({
                OR: [
                    { name: { contains: word, mode: "insensitive" } },
                    { email: { contains: word, mode: "insensitive" } },
                    { mobileNumber: { contains: word, mode: "insensitive" } },
                ],
            }));
        }
        const participants = await prisma_1.default.participant.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                mobileNumber: true,
                approved: true,
                createdAt: true,
                createdById: true,
            },
        });
        console.log(participants);
        return server_1.NextResponse.json({ participants });
    }
    catch (err) {
        console.error("Error fetching participants:", err);
        return server_1.NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
