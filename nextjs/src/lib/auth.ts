import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'loja_vapes_cyber_glow_super_secret_jwt_key_2026';

export interface UserPayload {
  id: number;
  email: string;
  role: string;
  name: string;
}

export function generateToken(user: UserPayload): string {
  return jwt.sign(
    user,
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function requireAuth(): Promise<UserPayload> {
  const user = await getUserFromToken();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireAdmin(): Promise<UserPayload> {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }

  return user;
}
