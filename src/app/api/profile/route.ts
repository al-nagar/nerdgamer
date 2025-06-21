import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../../lib/auth-middleware';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const user = authResult.user;

  try {
    // Get user data from database
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true, // Add this line
        about: true, // Add this line
        createdAt: true,
        updatedAt: true,
        profileImage: true
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Profile Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }
  const user = authResult.user;
  const formData = await request.formData();
  const file = formData.get('profileImage');
  const name = formData.get('name');
  const about = formData.get('about');
  let updateData: any = {};
  if (file && typeof file !== 'string') {
    // @ts-ignore
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop();
    const fileName = `${user.userId}_${Date.now()}.${ext}`;
    const dir = path.join(process.cwd(), 'public', 'profile-images');
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, fileName);
    await writeFile(filePath, buffer);
    const imageUrl = `/profile-images/${fileName}`;
    updateData.profileImage = imageUrl;
  }
  if (name && typeof name === 'string') {
    updateData.name = name;
  }
  if (about && typeof about === 'string') {
    updateData.about = about;
  }
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No data to update' }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: user.userId },
    data: updateData
  });
  return NextResponse.json({ success: true });
} 

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }
  const user = authResult.user;
  await prisma.user.update({
    where: { id: user.userId },
    data: { profileImage: null }
  });
  return NextResponse.json({ success: true });
} 