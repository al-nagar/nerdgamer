import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  const { slug } = await params;
  try {
    const updated = await prisma.gameCache.upsert({
      where: { slug },
      update: { views: { increment: 1 } },
      create: { slug, gameData: {}, views: 1 },
    });
    return NextResponse.json({ views: updated.views });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to increment views.' }, { status: 500 });
  }
} 