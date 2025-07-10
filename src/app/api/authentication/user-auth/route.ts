import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/utils/prisma';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) return NextResponse.json({ user: null }, { status: 401 });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
