"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const date_fns_1 = require("date-fns");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function POST(req) {
    const body = await req.json();
    const { search = "", fromDate, toDate } = body;
    try {
        const userActivities = await prisma_1.default.participantTracking.findMany({
            where: {
                participant: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                loginTime: {
                    gte: fromDate ? new Date((0, date_fns_1.startOfDay)(new Date(fromDate))) : undefined,
                    lte: toDate ? new Date((0, date_fns_1.endOfDay)(new Date(toDate))) : undefined,
                },
            },
            include: {
                participant: true,
            },
            orderBy: {
                loginTime: "desc",
            },
        });
        return server_1.NextResponse.json({ data: userActivities });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to fetch user activities" }, { status: 500 });
    }
}
