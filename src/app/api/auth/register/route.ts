// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { Types } from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already in use' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Will be hashed by pre-save hook
      onboardingCompleted: false,
    });

    await newUser.save();

    // Use type assertion to handle the _id type
    const userId = (newUser._id as Types.ObjectId).toString();

    // Generate token
    const token = await generateToken({
      id: userId,
      name: newUser.name,
      email: newUser.email,
      onboardingCompleted: false,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        onboardingCompleted: false,
      },
    });

    // Set cookie
    response.cookies.set({
      name: 'nutritrack_auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to register user' },
      { status: 500 }
    );
  }
}