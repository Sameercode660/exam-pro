"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("@/generated/prisma");
let prisma;
if (process.env.NODE_ENV === "production") {
    prisma = new prisma_1.PrismaClient(); // production
}
else {
    if (!global.prisma) {
        global.prisma = new prisma_1.PrismaClient();
    }
    prisma = global.prisma;
}
exports.default = prisma;
