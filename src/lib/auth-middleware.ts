import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

export async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  return decoded;
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return { error: 'Authentication required' };
  }
  
  return { user };
} 