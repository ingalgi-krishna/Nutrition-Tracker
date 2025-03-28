// src/lib/jwt.ts
import { jwtVerify, SignJWT } from 'jose';

// Ensure the secret is properly encoded
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nutritrack-fallback-secret-key'
);

export async function generateToken(payload: any): Promise<string> {
  // Create a new JWT with the payload
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string | undefined): Promise<any> {
  try {
    // More robust handling of missing/invalid tokens
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.log('Token is empty or invalid format');
      return null;
    }

    // Log token format for debugging (only first few chars)
    console.log(`Verifying token (first 10 chars): ${token.substring(0, 10)}...`);

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}