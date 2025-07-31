"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
const XLSX = __importStar(require("xlsx"));
async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const groupId = Number(formData.get("groupId"));
        const organizationId = Number(formData.get("organizationId"));
        if (!file || !groupId || !organizationId) {
            return server_1.NextResponse.json({ error: "file, groupId, and organizationId are required." }, { status: 400 });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        const emails = data.map((row) => row.email.toLowerCase());
        // Fetch participants in the same organization
        const participants = await prisma_1.default.participant.findMany({
            where: {
                organizationId,
                email: { in: emails },
            },
            select: { id: true, email: true, name: true },
        });
        const matchedEmails = participants.map((p) => p.email.toLowerCase());
        const unmatchedEmails = emails.filter(email => !matchedEmails.includes(email));
        const participantIds = participants.map(p => p.id);
        // Find existing group participants
        const existingGroupParticipants = await prisma_1.default.groupParticipant.findMany({
            where: {
                groupId,
                participantId: { in: participantIds },
            },
            select: { participantId: true },
        });
        const existingIds = existingGroupParticipants.map(p => p.participantId);
        // Prepare lists for response
        const alreadyInGroup = participants.filter(p => existingIds.includes(p.id));
        const toAdd = participants.filter(p => !existingIds.includes(p.id));
        // Bulk insert new participants
        if (toAdd.length > 0) {
            await prisma_1.default.groupParticipant.createMany({
                data: toAdd.map(p => ({
                    groupId,
                    participantId: p.id,
                })),
                skipDuplicates: true,
            });
        }
        return server_1.NextResponse.json({
            message: "File processed.",
            addedNames: toAdd.map(p => p.name),
            alreadyInGroupNames: alreadyInGroup.map(p => p.name),
            unmatchedEmails,
        });
    }
    catch (error) {
        console.error(error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
