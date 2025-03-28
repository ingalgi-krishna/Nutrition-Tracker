// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('nutritrack_auth_token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No token found',
      });
    }

    const decodedToken = await verifyToken(token);

    if (!decodedToken) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token',
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
        onboardingCompleted: decodedToken.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify token',
    });
  }
}