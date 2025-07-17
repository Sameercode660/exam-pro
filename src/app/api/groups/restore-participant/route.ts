import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: Request) {
  try {
    const { groupId, participantId } = await req.json();

    await prisma.groupParticipant.updateMany({
      where: { groupId, participantId },
      data: { visibility: true },
    });

    return NextResponse.json({ message: 'Participant restored successfully' });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
