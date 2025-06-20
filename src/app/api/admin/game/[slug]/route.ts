import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  const user = verifyToken(token);
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function PATCH(request, { params }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = await params;
  const body = await request.json();
  if (!body || !body.gameData) return NextResponse.json({ error: 'Missing gameData' }, { status: 400 });
  const updated = await prisma.gameCache.update({
    where: { slug },
    data: { gameData: body.gameData },
  });
  return NextResponse.json({ success: true, updated });
}

export async function DELETE(request, { params }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = await params;
  await prisma.gameCache.delete({ where: { slug } });
  return NextResponse.json({ success: true });
} 