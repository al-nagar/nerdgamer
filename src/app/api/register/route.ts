import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();

    // Basic validation
    if (!email || !username || !password || password.length < 6) {
      return NextResponse.json({ error: 'Email, username, and password are required. Password must be at least 6 characters.' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores.' }, { status: 400 });
    }

    // Check if user/email/username already exists
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
      }
      if (existingUser.username === username) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
      }
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create the new user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
      },
    });

    // Don't return the password hash in the response
    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 