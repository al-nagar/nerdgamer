import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  try {
    // Delete all votes by the user
    await prisma.commentVote.deleteMany({ where: { userId: user.userId } });
    await prisma.gameVote.deleteMany({ where: { userId: user.userId } });
    // Anonymize comments
    await prisma.comment.updateMany({
      where: { authorId: user.userId },
      data: { authorId: null, content: '[deleted]' },
    });
    // Delete the user
    await prisma.user.delete({ where: { id: user.userId } });
    // Clear the auth cookie
    const response = NextResponse.json({ message: 'Account deleted.' });
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete account.' }, { status: 500 });
  }
} 