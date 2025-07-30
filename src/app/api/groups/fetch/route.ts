 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

type RequestTypes = {
  adminId: number;
  organizationId: number;
  search: string;
}


export async function POST(req: NextRequest) {
  try {
    const { adminId, organizationId, search }: RequestTypes = await req.json();

    if (!adminId && !organizationId) {
      return NextResponse.json({ error: 'adminId or organizationId is required.' }, { status: 400 });
    }

    // Build base where clause
    const whereClause: any = {
      visibility: true,
    };

    if (adminId) {
      whereClause.createdById = adminId;
    } else if (organizationId) {
      whereClause.organizationId = organizationId;
    }

    // Search  (multiword search)
    if (search?.trim()) {
      const terms = search.trim().split(/\s+/);
      whereClause.OR = terms.flatMap((term: string) => [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        {
          createdBy: {
            name: { contains: term, mode: 'insensitive' }
          }
        }
      ]);
    }

    const groups = await prisma.group.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { name: true, id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
