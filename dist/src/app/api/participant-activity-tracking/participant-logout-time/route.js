"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function POST(req) {
    const body = await req.json();
    const { participantId } = body;
    try {
        const lastTracking = await prisma_1.default.participantTracking.findFirst({
            where: { participantId },
            orderBy: { loginTime: "desc" },
        });
        if (!lastTracking) {
            return new Response("No tracking session found", { status: 404 });
        }
        const logoutTime = new Date();
        const loginTime = new Date(lastTracking.loginTime);
        const spentMilliseconds = logoutTime.getTime() - loginTime.getTime();
        const spentTime = Math.floor(spentMilliseconds / 1000); // store seconds as integer
        const updated = await prisma_1.default.participantTracking.update({
            where: { id: lastTracking.id },
            data: {
                logoutTime,
                spentTime // time in second
            },
        });
        return Response.json({ message: "Logout tracked", updated });
    }
    catch (error) {
        console.error("Logout Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
