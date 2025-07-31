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
        const { organizationId, search } = await request.json();
        if (!organizationId) {
            return server_1.NextResponse.json({ error: "organizationId is required" }, { status: 400 });
        }
        const participants = await prisma_1.default.participant.findMany({
            where: {
                visibility: false,
                organizationId,
                ...(search && {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            mobileNumber: {
                                contains: search,
                            },
                        },
                    ],
                }),
            },
            select: {
                id: true,
                name: true,
                mobileNumber: true,
                createdAt: true,
                createdBy: {
                    select: {
                        name: true,
                    },
                },
                updatedBy: {
                    select: {
                        name: true,
                    },
                },
                updatedAt: true
            },
        });
        const result = participants.map((p) => ({
            id: p.id,
            name: p.name,
            mobileNumber: p.mobileNumber,
            createdAt: p.createdAt,
            removedAt: p.updatedAt,
            createdBy: p.createdBy?.name ?? "self",
            removedBy: p.updatedBy?.name ?? null,
        }));
        return server_1.NextResponse.json({ data: result });
    }
    catch (err) {
        console.error("Error fetching participants:", err);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
