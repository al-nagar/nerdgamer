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

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get counts in parallel for better performance
    const [totalGames, totalUsers, totalComments, totalViews] = await Promise.all([
      prisma.gameCache.count(),
      prisma.user.count(),
      prisma.comment.count({ where: { deleted: false } }),
      prisma.gameCache.aggregate({
        _sum: {
          views: true
        }
      })
    ]);

    return NextResponse.json({
      totalGames,
      totalUsers,
      totalComments,
      totalViews: totalViews._sum.views || 0
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 