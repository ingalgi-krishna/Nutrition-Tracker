// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Remove the auth cookie
  response.cookies.set({
    name: 'nutritrack_auth_token',
    value: '',
    expires: new Date(0),
    path: '/',
  });

  return response;
}