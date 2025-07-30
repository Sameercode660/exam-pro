import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

type RequestTypes = {
  adminId: number;
}

export async function POST(req: NextRequest) {
  try {

    const {adminId}: Partial<RequestTypes> = await req.json();

    const admin = await prisma.user.findFirst({
      where: { id: adminId,  role: 'SuperAdmin' },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAdmins = await prisma.user.count({
      where: {
        role: {
          in: ['Admin'],
        },
      },
    });

    const totalOrganizations = await prisma.organization.count();

    return NextResponse.json({ admin, totalAdmins, totalOrganizations });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
