// src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
    try {
        // Get token from cookies
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

        const userId = decodedToken.id;

        await connectToDatabase();

        // Get user data
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Return user data (excluding password)
        return NextResponse.json({
            success: true,
            user: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                height: user.height,
                weight: user.weight,
                bmi: user.bmi,
                goalType: user.goalType,
                dietaryPreference: user.dietaryPreference,
                allergies: user.allergies,
                activityLevel: user.activityLevel,
                age: user.age,
                gender: user.gender,
                onboardingCompleted: user.onboardingCompleted,
            },
        });

    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
export const dynamic = 'force-dynamic';