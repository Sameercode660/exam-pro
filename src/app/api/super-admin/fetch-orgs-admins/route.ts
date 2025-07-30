
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

type RequestTypes = {
  search: string;
}

export async function POST(req: NextRequest) {
  try {
    const { search }: RequestTypes = await req.json();

    const searchWords: string[] = search?.split(' ').filter(Boolean) || [];

    const orConditions = searchWords.map((word) => ({
      OR: [
        { name: { contains: word, mode: 'insensitive' } },
        { email: { contains: word, mode: 'insensitive' } },
        { mobileNumber: { contains: word, mode: 'insensitive' } },
        { Organization: { name: { contains: word, mode: 'insensitive' } } },
      ],
    }));

    const whereClause: any = {
      role: 'Admin',
      ...(orConditions.length > 0 && { AND: orConditions }),
    };

    const admins = await prisma.user.findMany({
      where: whereClause,
      include: {
        Organization: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(admins);
  } catch (error) {

    if(error instanceof Error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
    console.error('Error fetching admins with organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}