import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { comparePassword, generateToken } from '../../../lib/auth';
import { serialize } from 'cookie';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    // Basic validation
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Username/email and password are required.' }, { status: 400 });
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });
    if (!user) {
      return NextResponse.json({ error: 'Invalid username/email or password.' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid username/email or password.' }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    // Serialize the cookie with enhanced security
    const cookie = serialize('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Create response with token
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );

    // Set the cookie in the response header
    response.headers.set('Set-Cookie', cookie);

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 