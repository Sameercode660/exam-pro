import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { PrismaClient, Difficulty } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Parse the form data to extract the file
    
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const adminId = 1;
    // const adminId = Number(formData.get('adminId'));


    if(!adminId) {
      return NextResponse.json({error: "No admin is found"}, {status: 400});
    }
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Read the file as a buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

    console.log('DataSheet', sheetData);
    

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
      let category = await prisma.category.findUnique({
        where: { name: categoryName },
      });
      if (!category) {
        category = await prisma.category.create({
          data: { name: categoryName },
        });
      }

      // Check or create the topic
      let topic = await prisma.topic.findFirst({
        where: { name: topicName, categoryId: category.id },
      });
      if (!topic) {
        topic = await prisma.topic.create({
          data: { name: topicName, categoryId: category.id },
        });
      }

      // Insert the question and options
      const createdQuestion = await prisma.question.create({
        data: {
          text,
          categoryId: category.id,
          topicId: topic.id,
          difficulty: difficultyLevel.toUpperCase() as Difficulty,
          correctOption: parseInt(correctOption),
          adminId,
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
