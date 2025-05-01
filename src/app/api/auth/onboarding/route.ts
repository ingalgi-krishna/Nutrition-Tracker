// src/app/api/auth/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import { verifyToken, generateToken } from '@/lib/jwt';
import { Document, Types } from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('nutritrack_auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the token
    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get onboarding data from request
    const {
      height,
      weight,
      goalType,
      dietaryPreference,
      allergies,
      activityLevel,
      age,
      gender,
      country,  // New field for country
      state,    // New field for state
    } = await request.json();

    await connectToDatabase();

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      decodedToken.id,
      {
        height,
        weight,
        bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
        goalType,
        dietaryPreference,
        allergies,
        activityLevel,
        age,
        gender,
        country,  // Save country
        state,    // Save state
        onboardingCompleted: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Use type assertion to handle the _id type
    const userId = (updatedUser._id as Types.ObjectId).toString();

    // Generate new token with updated onboarding status
    const newToken = await generateToken({
      id: userId,
      name: updatedUser.name,
      email: updatedUser.email,
      onboardingCompleted: true,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: userId,
        name: updatedUser.name,
        email: updatedUser.email,
        onboardingCompleted: true,
        country: updatedUser.country,
        state: updatedUser.state,
      },
    });

    // Set updated cookie
    response.cookies.set({
      name: 'nutritrack_auth_token',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}