import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  try {
    const { adminId } = await req.json();

    // Validation
    if (!adminId || typeof adminId !== 'number') {
      return NextResponse.json({ error: 'Invalid or missing adminId' }, { status: 400 });
    }

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Fetch groups created by this admin
    const groups = await prisma.group.findMany({
      where: {
        createdById: adminId,
        visibility: true, // optional: to show only visible groups
      },
      include: {
        organization: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
