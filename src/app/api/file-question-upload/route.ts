import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { PrismaClient, Category, Topic } from "@/generated/prisma";

const prisma = new PrismaClient();

enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
  VERY_HARD = "VERY_HARD",
  TRICKY = "TRICKY",
}

interface SheetRow {
  text: string;
  categoryName: string;
  topicName: string;
  options: string; // JSON string for options
  correctOption: string;
  difficulty: string;
  createdBy: string;
}

export async function POST(req: NextRequest) {
  try {
    // Parse the form data to extract the file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Read the file as a buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json<SheetRow>(
      workbook.Sheets[sheetName]
    );

    for (const row of sheetData) {
      const {
        text,
        categoryName,
        topicName,
        options,
        correctOption,
        difficulty,
        createdBy,
      } = row;

      console.log("row", row);
      // Validate required fields
      if (
        !text ||
        !categoryName ||
        !topicName ||
        !options ||
        !correctOption ||
        !difficulty ||
        !createdBy
      ) {
        return NextResponse.json(
          { error: "Missing required fields in Excel row." },
          { status: 400 }
        );
      }

      // Parse options as a JSON array
      let parsedOptions: string[];
      try {
        parsedOptions = JSON.parse(options).map((opt: string) => opt.trim()); // Trim each option
        if (!Array.isArray(parsedOptions)) {
          throw new Error("Options is not a valid array.");
        }
      } catch {
        return NextResponse.json(
          {
            error:
              "Invalid options format in Excel row. Ensure it is a valid JSON array.",
          },
          { status: 400 }
        );
      }

      // Validate correctOption
      // if (!parsedOptions.some((opt) => opt === correctOption.trim())) {
      //   return NextResponse.json(
      //     {
      //       error: `CorrectOption '${correctOption}' not found in options: ${parsedOptions.join(
      //         ", "
      //       )}`,
      //     },
      //     { status: 400 }
      //   );
      // }

      // Validate difficulty
      if (!Object.values(Difficulty).includes(difficulty as Difficulty)) {
        return NextResponse.json(
          { error: `Invalid difficulty level: ${difficulty}` },
          { status: 400 }
        );
      }

      // Check or create category
      let category: Category | null = await prisma.category.findUnique({
        where: { name: categoryName },
      });

      if (!category) {
        category = await prisma.category.create({
          data: { name: categoryName },
        });
      }

      // Check or create topic
      let topic: Topic | null = await prisma.topic.findFirst({
        where: {
          name: topicName,
          categoryId: category.id,
        },
      });

      if (!topic) {
        topic = await prisma.topic.create({
          data: {
            name: topicName,
            categoryId: category.id,
          },
        });
      }

      // Create question
      await prisma.question.create({
        data: {
          text,
          categoryId: category.id,
          topicId: topic.id,
          difficulty: difficulty as Difficulty,
          adminId: createdBy,
          options: {
            create: parsedOptions.map((optionText) => ({
              text: optionText.trim(),
              isCorrect: optionText.trim() === correctOption.trim(),
            })),
          },
          correctOption,
        },
      });
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
