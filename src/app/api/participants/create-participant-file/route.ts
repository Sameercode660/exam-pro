import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import prisma from "@/utils/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { StagingStatus, UploadType } from "@/generated/prisma";
import { formatDateTime } from "@/utils/format-date-time";

type RawRow = {
  name?: string;
  email?: string;
  mobileNumber?: string;
};

export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");


    const adminId = Number(formData.get("createdById"));
    const organizationId = Number(formData.get("organizationId"));
    const groupId = formData.get("groupId")
      ? Number(formData.get("groupId"))
      : undefined;
    const fileName = String(formData.get("fileName")) || "Participants.xlsx";

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "File not found or invalid" },
        { status: 400 }
      );
    }

    console.log("OganizationId", organizationId, )
    if (!adminId || !organizationId) {
      return NextResponse.json(
        { error: "Missing adminId or organizationId" },
        { status: 400 }
      );
    }

    // 1) Create a generic upload batch (used by FileUploadSummary list)
    const uploadBatch = await prisma.uploadBatch.create({
      data: { adminId, fileName, status: "PENDING" },
    });
    const batchId = uploadBatch.id;

    // 1b) Create a participant upload batch (linked from Participant.batchId)
    const participantBatch = await prisma.uploadParticipantBatch.create({
      data: { adminId, fileName, status: "PENDING" },
    });

    // 2) Parse Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json<RawRow>(
      workbook.Sheets[sheetName]
    );

    if (rawRows.length === 0) {
      await prisma.uploadBatch.update({
        where: { id: batchId },
        data: { status: "FAILED" },
      });
      await prisma.uploadParticipantBatch.update({
        where: { id: participantBatch.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: "No participants found in file." },
        { status: 400 }
      );
    }

    // 3) Stage rows
    const stagedPayload = rawRows.map((r) => ({
      name: String(r?.name ?? "").trim(),
      email: String(r?.email ?? "")
        .trim()
        .toLowerCase(),
      mobileNumber: String(r?.mobileNumber ?? "").trim(),
      password: generateRandomPassword(),
      organizationId,
      createdById: adminId,
      status: StagingStatus.PENDING as StagingStatus,
      batchId: participantBatch.id,
    }));

    await prisma.stagingParticipant.createMany({ data: stagedPayload });

    // 4) Validate + prepare actions
    const pendingRows = await prisma.stagingParticipant.findMany({
      where: { status: StagingStatus.PENDING, batchId: participantBatch.id },
      orderBy: { id: "asc" },
    });

    const pendingEmails = pendingRows.map((p) => p.email.toLowerCase());
    const pendingMobiles = pendingRows.map((p) => p.mobileNumber);

    const existingParticipants = await prisma.participant.findMany({
      where: {
        organizationId,
        OR: [
          { email: { in: pendingEmails } },
          { mobileNumber: { in: pendingMobiles } },
        ],
      },
      select: { id: true, email: true, mobileNumber: true, name: true },
    });

    const existingByEmail = new Map(
      existingParticipants.map((p) => [p.email.toLowerCase(), p])
    );
    const existingByMobile = new Map(
      existingParticipants.map((p) => [p.mobileNumber, p])
    );

    // If group is provided, check who is already in it
    const alreadyInGroupIds = new Set<number>();
    if (groupId) {
      const existingInGroup = await prisma.groupParticipant.findMany({
        where: {
          groupId,
          participantId: { in: existingParticipants.map((p) => p.id) },
        },
        select: { participantId: true },
      });
      for (const g of existingInGroup) alreadyInGroupIds.add(g.participantId);
    }

    // Buckets
    const invalidIds: number[] = [];
    const duplicateIds: number[] = [];
    const importedIds: number[] = [];

    const createParticipants: Array<{
      name: string;
      email: string;
      mobileNumber: string;
      password: string;
      organizationId: number;
      createdById: number;
      approved: boolean;
      batchId: number | null; // link to UploadParticipantBatch
    }> = [];

    const toAddExistingToGroup: number[] = [];
    const emailsToSend: Array<{
      email: string;
      name: string;
      password: string;
    }> = [];

    // For summary rows
    // Columns: Row No | Name | Email | Mobile | Status | Note
    const summaryRows: Array<[number, string, string, string, string, string]> =
      [];

    let createdNew = 0;
    let addedExistingToGroup = 0;
    let alreadyInGroupCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;

    for (let i = 0; i < pendingRows.length; i++) {
      const row = pendingRows[i];

      const isValid =
        !!row.name &&
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(row.email) &&
        /^\d{10}$/.test(row.mobileNumber);

      if (!isValid) {
        invalidIds.push(row.id);
        invalidCount++;
        summaryRows.push([
          i + 1,
          row.name || "",
          row.email || "",
          row.mobileNumber || "",
          String(StagingStatus.INVALID),
          "Invalid format",
        ]);
        continue;
      }

      const existing =
        existingByEmail.get(row.email.toLowerCase()) ||
        existingByMobile.get(row.mobileNumber);

      if (existing) {
        // mark staging as duplicate
        duplicateIds.push(row.id);
        duplicateCount++;

        // Group handling for existing participant
        if (groupId) {
          if (!alreadyInGroupIds.has(existing.id)) {
            toAddExistingToGroup.push(existing.id);
            addedExistingToGroup++;
            summaryRows.push([
              i + 1,
              row.name,
              row.email,
              row.mobileNumber,
              String(StagingStatus.DUPLICATE),
              "Existing participant; added to group",
            ]);
          } else {
            alreadyInGroupCount++;
            summaryRows.push([
              i + 1,
              row.name,
              row.email,
              row.mobileNumber,
              String(StagingStatus.DUPLICATE),
              "Existing participant; already in group",
            ]);
          }
        } else {
          summaryRows.push([
            i + 1,
            row.name,
            row.email,
            row.mobileNumber,
            String(StagingStatus.DUPLICATE),
            "Existing participant",
          ]);
        }
        continue;
      }

      // New participant: create + add to group (if provided)
      createParticipants.push({
        name: row.name,
        email: row.email.toLowerCase(),
        mobileNumber: row.mobileNumber,
        password: row.password,
        organizationId,
        createdById: adminId,
        approved: true,
        batchId: participantBatch.id, // link to UploadParticipantBatch
      });

      importedIds.push(row.id);
      emailsToSend.push({
        email: row.email.toLowerCase(),
        name: row.name,
        password: row.password,
      });
    }

    // 5) Transaction: create new participants, add to group, update staging, update batches
    let createdParticipantIds: number[] = [];

    await prisma.$transaction(async (tx) => {
      // Create new participants
      if (createParticipants.length > 0) {
        await tx.participant.createMany({ data: createParticipants });

        const created = await tx.participant.findMany({
          where: {
            organizationId,
            email: { in: createParticipants.map((c) => c.email) },
          },
          select: { id: true, email: true },
        });
        createdParticipantIds = created.map((p) => p.id);
        createdNew = createdParticipantIds.length;
      }

      // Add to group (existing + newly created)
      if (groupId) {
        const groupAddIds = [...toAddExistingToGroup, ...createdParticipantIds];
        if (groupAddIds.length > 0) {
          await tx.groupParticipant.createMany({
            data: groupAddIds.map((participantId) => ({
              groupId,
              participantId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Update staging statuses
      if (invalidIds.length > 0) {
        await tx.stagingParticipant.updateMany({
          where: { id: { in: invalidIds } },
          data: {
            status: StagingStatus.INVALID,
            errorMessage: "Invalid format",
          },
        });
      }
      if (duplicateIds.length > 0) {
        await tx.stagingParticipant.updateMany({
          where: { id: { in: duplicateIds } },
          data: { status: StagingStatus.DUPLICATE, errorMessage: "Duplicate" },
        });
      }
      if (importedIds.length > 0) {
        await tx.stagingParticipant.updateMany({
          where: { id: { in: importedIds } },
          data: { status: StagingStatus.IMPORTED, errorMessage: null },
        });
      }

      // Batch statuses
      const totalFailed = invalidCount; // invalid are failures; duplicates aren't "failed", they are skipped
      const batchStatus =
        createdNew > 0 && totalFailed === 0
          ? "IMPORTED"
          : createdNew > 0 && totalFailed > 0
          ? "PARTIAL"
          : "FAILED";

      await tx.uploadBatch.update({
        where: { id: batchId },
        data: { status: batchStatus },
      });

      await tx.uploadParticipantBatch.update({
        where: { id: participantBatch.id },
        data: { status: batchStatus },
      });
    });

    // Add success rows for newly created after we know they were created
    // (We push these after the transaction to ensure counts are final)
    for (let i = 0; i < pendingRows.length; i++) {
      const row = pendingRows[i];
      if (importedIds.includes(row.id)) {
        const note = groupId ? "Created and added to group" : "Created";
        summaryRows.push([
          i + 1,
          row.name,
          row.email,
          row.mobileNumber,
          String(StagingStatus.IMPORTED),
          note,
        ]);
      }
    }

    // 6) Send credential emails to newly created participants (best-effort)
    if (emailsToSend.length > 0) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      for (const { email, name, password } of emailsToSend) {
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
          // We won't fail the request for email issues; optionally collect these
          console.error(`Email send failed for ${email}`, e);
        }
      }
    }

    // 7) Admin info for summary
    const admin = await prisma.user.findUnique({ where: { id: adminId } });

    // 8) Build + save summary
    const inserted = createdNew;
    const skipped = duplicateCount;
    const failed = invalidCount;
    const batchStatus =
      inserted > 0 && failed === 0
        ? "IMPORTED"
        : inserted > 0 && failed > 0
        ? "PARTIAL"
        : "FAILED";

    const summaryData = {
      columns: ["Row No", "Name", "Email", "Mobile", "Status", "Note"],
      rows: summaryRows.map(([rowNo, name, email, mobile, status, note]) => [
        rowNo,
        name,
        email,
        mobile,
        String(status),
        note,
      ]),
      totals: {
        inserted,
        skipped,
        failed,
        total: inserted + skipped + failed,
        alreadyInGroup: alreadyInGroupCount,
      },
      meta: {
        adminName: admin?.name,
        fileName,
        // IMPORTANT: use UploadBatch.id for FileUploadSummary consistency
        batchId,
        participantBatchId: participantBatch.id,
        processedAt: formatDateTime(new Date()),
        batchStatus,
        organizationId,
        groupId: groupId ?? null,
        uploadType: groupId
          ? UploadType.PARTICIPANT_GROUP_ADD
          : UploadType.PARTICIPANT_FILE,
      },
    };

    await prisma.fileUploadSummary.create({
      data: {
        batchId, // points to UploadBatch
        adminId,
        type: groupId
          ? UploadType.PARTICIPANT_GROUP_ADD
          : UploadType.PARTICIPANT_FILE,
        fileName,
        inserted,
        skipped,
        failed,
        summaryData,
      },
    });

    // 9) Response (compatible with your Excel downloader)
    return NextResponse.json({
      message: "Participants upload completed",
      batchId, // this is the UploadBatch.id used by your summaries list
      inserted,
      skipped,
      failed,
      batchStatus,
      summaryData,
    });
  } catch (error) {
    console.error("Participants Upload Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateRandomPassword() {
  const min = 10000000;
  const max = 99999999;
  const randomBytes = crypto.randomBytes(4).readUInt32BE(0);
  return (min + (randomBytes % (max - min + 1))).toString();
}
