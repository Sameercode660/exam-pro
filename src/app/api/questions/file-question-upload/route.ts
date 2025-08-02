import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import prisma from "@/utils/prisma";
import { Difficulty, StagingStatus } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const { searchParams } = req.nextUrl;
    const adminId = Number(searchParams.get("adminId"));


    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "File not found or invalid" },
        { status: 400 }
      );
    }

    console.log("Received file:", file);

    if (!adminId || !file) {
      return NextResponse.json(
        { error: "Missing adminId or file." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

    const stagedData = rawRows.map((row) => ({
      adminId,
      categoryName: String(row.categoryName || "").trim(),
      topicName: String(row.topicName || "").trim(),
      question: String(row.question || "").trim(),
      option1: String(row.option1 || "").trim(),
      option2: String(row.option2 || "").trim(),
      option3: String(row.option3 || "").trim(),
      option4: String(row.option4 || "").trim(),
      correctOption: Number(row.correctOption),
      difficultyLevel: String(row.difficultyLevel || "")
        .trim()
        .toUpperCase(),
      status: StagingStatus.PENDING,
    }));
    // 1. Insert all to staging table
    await prisma.stagingQuestion.createMany({ data: stagedData });

    const pendingRows = await prisma.stagingQuestion.findMany({
      where: { status: "PENDING", adminId },
    });

    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of pendingRows) {
      let error = "";

      const isValid =
        row.categoryName &&
        row.topicName &&
        row.question &&
        [1, 2, 3, 4].includes(row.correctOption ?? 0) &&
        ["EASY", "MEDIUM", "HARD"].includes(row.difficultyLevel ?? "");

      if (!isValid) {
        error = "Invalid format";
      } else {
        const exists = await prisma.question.findFirst({
          where: { text: row.question!, adminId },
        });

        if (exists) error = "Duplicate";
      }

      if (error) {
        await prisma.stagingQuestion.update({
          where: { id: row.id },
          data: {
            status: error === "Duplicate" ? "DUPLICATE" : "INVALID",
            errorMessage: error,
          },
        });
        error === "Duplicate" ? skipped++ : failed++;
        continue;
      }

      // Insert into main tables
      try {
        const category = await prisma.category.upsert({
          where: {
            name_adminId: {
              name: row.categoryName!,
              adminId,
            },
          },
          update: {},
          create: {
            name: row.categoryName!,
            adminId,
          },
        });

        const topic = await prisma.topic.upsert({
          where: {
            name_categoryId_adminId: {
              name: row.topicName!,
              categoryId: category.id,
              adminId,
            },
          },
          update: {},
          create: {
            name: row.topicName!,
            categoryId: category.id,
            adminId,
          },
        });

        await prisma.question.create({
          data: {
            text: row.question!,
            categoryId: category.id,
            topicId: topic.id,
            difficulty: row.difficultyLevel as Difficulty,
            correctOption: row.correctOption!,
            adminId: adminId,
            options: {
              create: [
                { text: row.option1!, isCorrect: row.correctOption === 1 },
                { text: row.option2!, isCorrect: row.correctOption === 2 },
                { text: row.option3!, isCorrect: row.correctOption === 3 },
                { text: row.option4!, isCorrect: row.correctOption === 4 },
              ],
            },
          },
        });

        await prisma.stagingQuestion.update({
          where: { id: row.id },
          data: {
            status: "IMPORTED",
            errorMessage: null,
          },
        });

        inserted++;
      } catch (err) {
        console.error("DB Insert Error:", err);
        failed++;
        await prisma.stagingQuestion.update({
          where: { id: row.id },
          data: {
            status: "INVALID",
            errorMessage: "DB Insert Failed",
          },
        });
      }
    }

    return NextResponse.json({
      message: "Full Upload Completed using staging",
      inserted,
      skipped,
      failed,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
