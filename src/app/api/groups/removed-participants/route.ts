import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

type RequestTypes = {
  groupId: number;
}


export async function POST(req: Request) {
  try {
    const { groupId }: Partial<RequestTypes> = await req.json();

    const removedParticipants = await prisma.groupParticipant.findMany({
      where: {
        groupId,
        visibility: false,
      },
      select: {
        participantId: true,
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      participants: removedParticipants.map(p => ({
        id: p.participantId,
        name: p.user.name,
        email: p.user.email
      }))
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
