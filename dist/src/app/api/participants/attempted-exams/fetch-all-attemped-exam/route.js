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
        const { userId } = await req.json();
        const parsedUserId = Number(userId);
        if (!parsedUserId || isNaN(parsedUserId)) {
            return server_1.NextResponse.json({ status: false, message: "Invalid userId" }, { status: 400 });
        }
        // Fetch attempted exams
        const attemptedExams = await prisma_1.default.examParticipant.findMany({
            where: {
                userId: parsedUserId,
                status: {
                    in: ["Completed", "InProgress"] // attempted exams
                }
            },
            select: {
                exam: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        createdAt: true,
                        GroupExam: {
                            select: {
                                group: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                startTime: true,
                endTime: true,
                status: true,
                examId: true,
                userId: true,
            }
        });
        // Fetch results in bulk for performance
        const results = await prisma_1.default.result.findMany({
            where: {
                userId: parsedUserId,
                examId: {
                    in: attemptedExams.map((e) => e.examId)
                }
            }
        });
        // Map results by examId for easy lookup
        const resultMap = new Map();
        results.forEach(r => {
            resultMap.set(r.examId, { score: r.score, total: r.total });
        });
        // Final response
        const data = attemptedExams.map(e => ({
            examId: e.exam.id,
            title: e.exam.title,
            description: e.exam.description,
            groupName: e.exam.GroupExam[0]?.group.name || "Not Assigned via Group",
            attemptedAt: e.endTime || e.startTime,
            status: e.status,
            score: resultMap.get(e.examId)?.score ?? 0,
            totalQuestions: resultMap.get(e.examId)?.total ?? 0,
        }));
        return server_1.NextResponse.json({
            status: true,
            message: "Attempted exams fetched successfully",
            data
        });
    }
    catch (err) {
        console.error(err);
        return server_1.NextResponse.json({
            status: false,
            message: err.message || "Server Error",
        }, { status: 500 });
    }
}
