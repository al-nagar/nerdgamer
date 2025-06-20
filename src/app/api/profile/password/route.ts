import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyToken, comparePassword } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'Current and new password required. New password must be at least 8 characters.' }, { status: 400 });
  }
  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    const isValid = await comparePassword(currentPassword, dbUser.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.userId },
      data: { passwordHash },
    });
    return NextResponse.json({ message: 'Password updated successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }
} 