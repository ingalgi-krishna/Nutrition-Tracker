// src/lib/auth.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from './jwt';
import { UserProfile } from '../types/user';

export const TOKEN_NAME = 'nutritrack_auth_token';

// Server-side functions
export function getAuthToken(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(TOKEN_NAME)?.value;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
}

export async function requireOnboarding() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  if (!user.onboardingCompleted) {
    redirect('/auth/onboarding');
  }

  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();
  if (user) {
    if (!user.onboardingCompleted) {
      redirect('/auth/onboarding');
    } else {
      redirect('/dashboard');
    }
  }
}