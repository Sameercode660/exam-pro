import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import * as XLSX from "xlsx";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { StagingStatus } from "@/generated/prisma"; // enum: PENDING | VALID | INVALID | DUPLICATE | IMPORTED

type RawRow = {
  name?: string;
  email?: string;
  mobileNumber?: string;
};

type NormalizedRow = {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
};

export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const groupId = Number(formData.get("groupId"));
    const organizationId = Number(formData.get("organizationId"));
    const createdById = Number(formData.get("createdById"));

    if (!file || !groupId || !organizationId || !createdById) {
      return NextResponse.json(
        { error: "file, groupId, organizationId and createdById are required." },
        { status: 400 }
      );
    }

    // 1) Create the batch (PENDING)
    const batch = await prisma.uploadParticipantBatch.create({
      data: {
        adminId: createdById,
        fileName: file.name,
        status: "PENDING",
      },
    });

    // 2) Read the excel
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json<RawRow>(worksheet);

    if (rawData.length === 0) {
      await prisma.uploadParticipantBatch.update({
        where: { id: batch.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "No participants found in file." }, { status: 400 });
    }

    // 3) Normalize + stage all rows (PENDING)
    const stagedRows: NormalizedRow[] = rawData.map((row) => ({
      name: String(row?.name ?? "").trim(),
      email: String(row?.email ?? "").trim().toLowerCase(),
      mobileNumber: String(row?.mobileNumber ?? "").trim(),
      password: generateRandomPassword(),
    }));

    await prisma.stagingParticipant.createMany({
      data: stagedRows.map((r) => ({
        name: r.name,
        email: r.email,
        mobileNumber: r.mobileNumber,
        password: r.password,
        organizationId,
        createdById,
        status: StagingStatus.PENDING,
        batchId: batch.id,
      })),
    });

    // 4) Fetch PENDING rows for this batch to validate
    const pendingRows = await prisma.stagingParticipant.findMany({
      where: { batchId: batch.id, status: StagingStatus.PENDING },
      orderBy: { id: "asc" },
    });

    // Build easy lookups
    const pendingEmails = pendingRows.map((p) => p.email);
    const pendingMobiles = pendingRows.map((p) => p.mobileNumber);

    // 5) Lookup existing participants by email or mobile
    const existingParticipants = await prisma.participant.findMany({
      where: {
        OR: [
          { email: { in: pendingEmails } },
          { mobileNumber: { in: pendingMobiles } },
        ],
        organizationId,
      },
      select: { id: true, email: true, mobileNumber: true, name: true },
    });
    const existingByEmail = new Map(existingParticipants.map((p) => [p.email.toLowerCase(), p]));
    const existingByMobile = new Map(existingParticipants.map((p) => [p.mobileNumber, p]));

    // 6) Determine which existing participants are already in the group
    const existingIds = existingParticipants.map((p) => p.id);
    const existingInGroup = await prisma.groupParticipant.findMany({
      where: { groupId, participantId: { in: existingIds } },
      select: { participantId: true },
    });
    const alreadyInGroupIds = new Set(existingInGroup.map((g) => g.participantId));

    // Buckets
    const invalidStagingIds: number[] = [];
    const duplicateStagingIds: number[] = []; // existing participant -> mark DUPLICATE in staging (since they already exist)
    const importedStagingIds: number[] = [];

    const toGroupExisting: number[] = []; // existing participant IDs to add to group
    const createPayload: {
      name: string;
      email: string;
      mobileNumber: string;
      password: string;
      organizationId: number;
      createdById: number;
      approved: boolean;
      batchId: number;
    }[] = [];

    const createdEmails: { email: string; name: string; password: string }[] = [];

    // 7) Validate each staged row
    for (const row of pendingRows) {
      const isValid =
        !!row.name &&
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(row.email) &&
        /^\d{10}$/.test(row.mobileNumber);

      if (!isValid) {
        invalidStagingIds.push(row.id);
        continue;
      }

      const existing =
        existingByEmail.get(row.email.toLowerCase()) ||
        existingByMobile.get(row.mobileNumber);

      if (existing) {
        // Existing participant -> mark staging DUPLICATE
        duplicateStagingIds.push(row.id);
        // Add to group if not already
        if (!alreadyInGroupIds.has(existing.id)) {
          toGroupExisting.push(existing.id);
        }
        continue;
      }

      // New participant -> will create + import
      createPayload.push({
        name: row.name,
        email: row.email.toLowerCase(),
        mobileNumber: row.mobileNumber,
        password: row.password,
        organizationId,
        createdById,
        approved: true,
        batchId: batch.id,
      });

      createdEmails.push({
        email: row.email.toLowerCase(),
        name: row.name,
        password: row.password,
      });

      importedStagingIds.push(row.id); // mark IMPORTED after creation
    }

    // Counts for response
    const alreadyInGroupCount =
      existingParticipants.filter((p) => alreadyInGroupIds.has(p.id)).length;
    const willAddExistingCount = toGroupExisting.length;
    const toCreateCount = createPayload.length;
    const invalidCount = invalidStagingIds.length;
    const duplicateCount = duplicateStagingIds.length;

    // 8) Transaction: create new participants, add all (existing+new) to group, update staging
    let createdParticipantsIds: number[] = [];

    await prisma.$transaction(async (tx) => {
      if (createPayload.length > 0) {
        await tx.participant.createMany({ data: createPayload });

        // Re-fetch created by email to get IDs
        const justCreated = await tx.participant.findMany({
          where: {
            organizationId,
            email: { in: createPayload.map((c) => c.email) },
          },
          select: { id: true, email: true },
        });
        createdParticipantsIds = justCreated.map((p) => p.id);
      }

      // Group insert: existing to add + newly created
      const groupInsertIds = [...toGroupExisting, ...createdParticipantsIds];
      if (groupInsertIds.length > 0) {
        await tx.groupParticipant.createMany({
          data: groupInsertIds.map((participantId) => ({
            groupId,
            participantId,
          })),
          skipDuplicates: true,
        });
      }

      // Update staging statuses
      if (invalidStagingIds.length > 0) {
        await tx.stagingParticipant.updateMany({
          where: { id: { in: invalidStagingIds } },
          data: { status: StagingStatus.INVALID },
        });
      }
      if (duplicateStagingIds.length > 0) {
        await tx.stagingParticipant.updateMany({
          where: { id: { in: duplicateStagingIds } },
          data: { status: StagingStatus.DUPLICATE },
        });
      }
      if (importedStagingIds.length > 0) {
        await tx.stagingParticipant.updateMany({
          where: { id: { in: importedStagingIds } },
          data: { status: StagingStatus.IMPORTED },
        });
      }

      // Update batch status based on results
      const newStatus =
        toCreateCount > 0 ? "IMPORTED" : invalidCount === pendingRows.length ? "FAILED" : "VALID";
      await tx.uploadParticipantBatch.update({
        where: { id: batch.id },
        data: { status: newStatus },
      });
    });

    // 9) Send emails to newly created participants (outside transaction)
    if (createdEmails.length > 0) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      for (const { email, name, password } of createdEmails) {
        try {
          await transporter.sendMail({
            from: `"Exam Pro Credential" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Your Exam Portal Account Credentials",
            text: `Hello ${name},

Your account has been created.

Email: ${email}
Password: ${password}

Please login and change your password after first login.

Regards,
Exam Pro Team`,
          });
        } catch (e) {
          // optional: collect/return email failures
          console.error(`Email send failed for ${email}`, e);
        }
      }
    }

    return NextResponse.json({
      message: "Participants processed via batch + staging and added to group.",
      batchId: batch.id,
      summary: {
        fileRows: rawData.length,
        invalidCount,
        duplicateCount,
        createdAndAddedToGroup: createdParticipantsIds.length,
        addedToGroupExisting: willAddExistingCount,
        alreadyInGroup: alreadyInGroupCount,
      },
    });
  } catch (error) {
    console.error("Merged import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateRandomPassword() {
  const min = 10000000;
  const max = 99999999;
  const randomBytes = crypto.randomBytes(4).readUInt32BE(0);
  return (min + (randomBytes % (max - min + 1))).toString();
}
