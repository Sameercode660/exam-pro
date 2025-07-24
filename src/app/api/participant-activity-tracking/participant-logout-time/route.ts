import { NextRequest } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { participantId } = body;

  try {
    const lastTracking = await prisma.participantTracking.findFirst({
      where: { participantId },
      orderBy: { loginTime: "desc" },
    });

    if (!lastTracking) {
      return new Response("No tracking session found", { status: 404 });
    }

    const logoutTime = new Date();
    const loginTime = new Date(lastTracking.loginTime);

    const spentMilliseconds = logoutTime.getTime() - loginTime.getTime();
    const spentTime = Math.floor(spentMilliseconds / 1000); // store seconds as integer

    const updated = await prisma.participantTracking.update({
      where: { id: lastTracking.id },
      data: {
        logoutTime,
        spentTime // time in second
      },
    });

    return Response.json({ message: "Logout tracked", updated });
  } catch (error) {
    console.error("Logout Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
