import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

type RequestTypes = {
  adminId: number;
}

export async function POST(req: NextRequest) {
  try {
    const { adminId }: RequestTypes = await req.json();

    if (!adminId) {
      return NextResponse.json({ error: 'adminId is required' }, { status: 400 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { organizationId: true },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error('Error fetching admin organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
