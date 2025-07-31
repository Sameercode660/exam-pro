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
const XLSX = __importStar(require("xlsx"));
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function POST(req) {
    try {
        // Parse the form data to extract the file
        const formData = await req.formData();
        const file = formData.get("file");
        const { searchParams } = req.nextUrl;
        const adminId = Number(searchParams.get("adminId"));
        console.log("adminId", adminId);
        if (!adminId) {
            return server_1.NextResponse.json({ error: "No admin is found" }, { status: 400 });
        }
        if (!file) {
            return server_1.NextResponse.json({ error: "No file uploaded." }, { status: 400 });
        }
        // Read the file as a buffer
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log("DataSheet", sheetData);
        // filtering the data
        const filteredData = sheetData.filter((row) => row.categoryName?.trim() &&
            row.topicName?.trim() &&
            row.question?.trim());
        for (const row of filteredData) {
            const { categoryName, topicName, question: text, option1, option2, option3, option4, correctOption, difficultyLevel, } = row;
            console.log(row);
            // Check or create the category
            const category = await prisma_1.default.category.upsert({
                where: {
                    name_adminId: {
                        name: categoryName,
                        adminId: adminId,
                    },
                },
                update: {}, // no change if exists
                create: {
                    name: categoryName,
                    adminId: adminId,
                },
            });
            // Check or create the topic
            const topic = await prisma_1.default.topic.upsert({
                where: {
                    name_categoryId_adminId: {
                        name: topicName,
                        categoryId: category.id,
                        adminId: adminId,
                    },
                },
                update: {},
                create: {
                    name: topicName,
                    categoryId: category.id,
                    adminId: adminId,
                },
            });
            // Insert the question and options
            const createdQuestion = await prisma_1.default.question.create({
                data: {
                    text,
                    categoryId: category.id,
                    topicId: topic.id,
                    difficulty: difficultyLevel.toUpperCase(),
                    correctOption: parseInt(correctOption),
                    adminId: Number(adminId),
                    options: {
                        create: [
                            { text: option1, isCorrect: correctOption === 1 },
                            { text: option2, isCorrect: correctOption === 2 },
                            { text: option3, isCorrect: correctOption === 3 },
                            { text: option4, isCorrect: correctOption === 4 },
                        ],
                    },
                },
            });
            console.log(`Created Question ID: ${createdQuestion.id}`);
        }
        return server_1.NextResponse.json({ message: "Questions uploaded successfully!" }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return server_1.NextResponse.json({ error: "Error processing file." }, { status: 500 });
    }
}
