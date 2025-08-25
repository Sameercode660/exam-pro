import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

type RequestTypes = {
  groupId: number;
};

export async function POST(req: NextRequest) {
  try {
    const { groupId }: Partial<RequestTypes> = await req.json();

    if (!groupId || typeof groupId !== 'number') {
      return NextResponse.json({ error: 'Invalid or missing groupId' }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
