import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  // Try to find by id or username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id },
        { username: id }
      ]
    },
    select: {
      id: true,
      name: true,
      profileImage: true,
      about: true,
      username: true,
    }
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ user });
} 