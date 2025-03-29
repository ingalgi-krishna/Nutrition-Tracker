// src/app/api/users/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(request: NextRequest) {
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
        const body = await request.json();

        // Extract fields from request body
        const {
            name,
            height,
            weight,
            goalType,
            dietaryPreference,
            allergies,
            activityLevel,
            age,
            gender,
        } = body;

        await connectToDatabase();

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Update user fields if provided
        if (name) user.name = name;
        if (height !== undefined) user.height = height;
        if (weight !== undefined) user.weight = weight;
        if (goalType) user.goalType = goalType;
        if (dietaryPreference) user.dietaryPreference = dietaryPreference;
        if (allergies) user.allergies = allergies;
        if (activityLevel) user.activityLevel = activityLevel;
        if (age !== undefined) user.age = age;
        if (gender) user.gender = gender;

        // Calculate BMI if height and weight are provided
        if (height && weight) {
            const heightInMeters = height / 100;
            user.bmi = Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
        }

        // Save the updated user
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id.toString(),
                name: user.name,
                height: user.height,
                weight: user.weight,
                bmi: user.bmi,
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}