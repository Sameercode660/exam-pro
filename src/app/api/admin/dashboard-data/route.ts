import { NextRequest } from "next/server";
import prisma from "@/utils/prisma";
import { RoleEnum } from "@/generated/prisma";

type RequestTypes = {
  organizationId: number
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<RequestTypes> = await req.json();
    const { organizationId } = body;

    if (!organizationId) {
      return new Response("organizationId is required", { status: 400 });
    }

    const [
      totalSuperUsers,
      totalParticipants,
      totalExams,
      totalQuestions,
      activeExams,
      inactiveExams,
    ] = await Promise.all([
      // Super Users directly tied to organization
      prisma.user.count({
        where: {
          organizationId,
          role: RoleEnum.SuperUser,
        },
      }),

      // Participants directly tied to organization
      prisma.participant.count({
        where: {
          organizationId,
        },
      }),

      // Exams created by users who belong to this org
      prisma.exam.count({
        where: {
          createdBy: {
            organizationId,
          },
        },
      }),

      // Questions created by users who belong to this org
      prisma.question.count({
        where: {
          admin: {
            organizationId,
          },
        },
      }),

      // Active Exams by org users
      prisma.exam.count({
        where: {
          status: 'Active',
          createdBy: {
            organizationId,
          },
        },
      }),

      // Inactive Exams by org users
      prisma.exam.count({
        where: {
          status: 'Inactive',
          createdBy: {
            organizationId,
          },
        },
      }),
    ]);

    return Response.json({
      totalSuperUsers,
      totalParticipants,
      totalExams,
      totalQuestions,
      activeExams,
      inactiveExams,
    });
  } catch (error) {
    console.error("Error fetching org stats:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
