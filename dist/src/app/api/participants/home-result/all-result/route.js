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
        const { participantId, query } = await req.json();
        if (!participantId) {
            return server_1.NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
        }
        const results = await prisma_1.default.result.findMany({
            where: {
                userId: participantId,
                exam: {
                    OR: [
                        {
                            title: {
                                contains: query || '',
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: query || '',
                                mode: 'insensitive',
                            },
                        },
                        {
                            GroupExam: {
                                some: {
                                    group: {
                                        name: {
                                            contains: query || '',
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                        },
                        {
                            createdBy: {
                                name: {
                                    contains: query || '',
                                    mode: 'insensitive',
                                },
                            },
                        },
                    ],
                },
            },
            include: {
                exam: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        createdAt: true,
                        duration: true,
                        createdBy: {
                            select: {
                                name: true,
                            },
                        },
                        GroupExam: {
                            select: {
                                group: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const formatted = results.map((res) => ({
            examId: res.exam.id,
            examTitle: res.exam.title,
            examDescription: res.exam.description,
            examCreatedAt: res.exam.createdAt,
            examDuration: res.exam.duration,
            attemptedDate: res.createdAt,
            groupName: res.exam.GroupExam[0]?.group?.name || 'N/A',
            teacher: res.exam.createdBy?.name || 'N/A',
        }));
        return server_1.NextResponse.json({ results: formatted });
    }
    catch (error) {
        console.error('Failed to fetch results:', error);
        return server_1.NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
