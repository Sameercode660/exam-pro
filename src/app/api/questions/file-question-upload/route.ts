import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { Difficulty } from "@/generated/prisma";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
  try {
    // Parse the form data to extract the file

    const formData = await req.formData();
    const file = formData.get("file") as File;

    const { searchParams } = req.nextUrl;
    const adminId = Number(searchParams.get("adminId"));

    console.log("adminId", adminId);

    if (!adminId) {
      return NextResponse.json({ error: "No admin is found" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Read the file as a buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

    console.log("DataSheet", sheetData);

    // filtering the data
    const filteredData = sheetData.filter(
      (row) =>
        row.categoryName?.trim() &&
        row.topicName?.trim() &&
        row.question?.trim()
    );

    for (const row of filteredData) {
      const {
        categoryName,
        topicName,
        question: text,
        option1,
        option2,
        option3,
        option4,
        correctOption,
        difficultyLevel,
      } = row;

      console.log(row);

      // Check or create the category
      const category = await prisma.category.upsert({
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
      const topic = await prisma.topic.upsert({
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
      const createdQuestion = await prisma.question.create({
        data: {
          text,
          categoryId: category.id,
          topicId: topic.id,
          difficulty: difficultyLevel.toUpperCase() as Difficulty,
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

    return NextResponse.json(
      { message: "Questions uploaded successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error processing file." },
      { status: 500 }
    );
  }
}
