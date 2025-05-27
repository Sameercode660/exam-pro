import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

interface questionTypes {
    text: string;
    options: string[];
    correctOption: number;
    examId: number;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({
        statusCode: 400,
        message: "File is required",
        status: false,
      });
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Validate and insert each row
    const questions = [];
    for (const row of rows) {
      const { text, options, correctOption, examId }: any = row;

      if (!text || !options || correctOption === undefined || !examId) {
        return NextResponse.json({
          statusCode: 400,
          message: "Invalid data in the file",
          status: false,
        });
      }

      const optionsArray = options.split(",").map((opt: string) => opt.trim());
      if (correctOption < 0 || correctOption >= optionsArray.length) {
        return NextResponse.json({
          statusCode: 400,
          message: "Invalid correctOption index",
          status: false,
        });
      }

      questions.push({
        text,
        options: optionsArray,
        correctOption: parseInt(correctOption, 10),
        examId,
      });
    }

    // Insert all questions into the database
    const createdQuestions = await prisma.question.createMany({
      data: questions,
      skipDuplicates: true, // Skip if a duplicate question exists
    });

    return NextResponse.json({
      statusCode: 200,
      message: "Questions added successfully",
      response: createdQuestions,
      status: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      statusCode: 500,
      message: "An error occurred while uploading questions",
      status: false,
    });
  }
}
