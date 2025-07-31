"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtime = void 0;
exports.GET = GET;
exports.runtime = "nodejs";
const server_1 = require("next/server");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function GET(req) {
    const token = req.cookies.get('token')?.value;
    if (!token)
        return server_1.NextResponse.json({ user: null }, { status: 401 });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await prisma_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user)
            return server_1.NextResponse.json({ user: null }, { status: 401 });
        return server_1.NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            },
        });
    }
    catch {
        return server_1.NextResponse.json({ user: null }, { status: 401 });
    }
}
