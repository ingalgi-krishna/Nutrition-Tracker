// src/app/api/water-intake/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import WaterIntake from '@/models/WaterIntake';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadImage } from '@/lib/cloudinary';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get water intake data for the day
export async function GET(request: NextRequest) {
    try {
        // Get token from cookies
        const token = request.cookies.get('nutritrack_auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify the token
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decodedToken.id;

        await connectToDatabase();

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Calculate recommended water intake based on weight
        // Standard recommendation is 35ml per kg of body weight
        let recommendedIntake = 2000; // Default value

        if (user.weight) {
            // Calculate based on weight: 35ml per kg
            recommendedIntake = Math.round(user.weight * 35);

            // Adjust based on activity level
            if (user.activityLevel) {
                switch (user.activityLevel) {
                    case 'sedentary':
                        // No additional adjustment
                        break;
                    case 'light':
                        recommendedIntake = Math.round(recommendedIntake * 1.1); // +10%
                        break;
                    case 'moderate':
                        recommendedIntake = Math.round(recommendedIntake * 1.2); // +20%
                        break;
                    case 'active':
                        recommendedIntake = Math.round(recommendedIntake * 1.3); // +30%
                        break;
                    case 'very_active':
                        recommendedIntake = Math.round(recommendedIntake * 1.4); // +40%
                        break;
                }
            }

            // Set minimum and maximum bounds
            recommendedIntake = Math.max(1500, Math.min(4000, recommendedIntake));
        }

        // Use user's set goal or the calculated recommendation
        const waterIntakeGoal = user.waterIntakeGoal || recommendedIntake;

        // Get today's water intake entries
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const waterIntakes = await WaterIntake.find({
            userId,
            timestamp: { $gte: today, $lt: tomorrow }
        }).sort({ timestamp: -1 }); // Newest first

        // Calculate total intake
        const totalIntake = waterIntakes.reduce((sum, entry) => sum + entry.amount, 0);
        const progress = Math.min(Math.round((totalIntake / waterIntakeGoal) * 100), 100);

        return NextResponse.json({
            success: true,
            data: {
                entries: waterIntakes,
                totalIntake,
                waterIntakeGoal,
                recommendedIntake,
                progress,
                unit: 'ml',
                weight: user.weight || null
            }
        });
    } catch (error) {
        console.error('Error in water intake API:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}

// Add water intake entry manually
export async function POST(request: NextRequest) {
    try {
        // Get token from cookies
        const token = request.cookies.get('nutritrack_auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify the token
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decodedToken.id;
        const { amount, method = 'manual', image = null } = await request.json();

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Valid amount is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        let imageUrl = null;

        // If image is provided, upload to Cloudinary
        if (image && (method === 'image' || method === 'camera')) {
            try {
                const cloudinaryResult = await uploadImage(image);
                imageUrl = cloudinaryResult.url;
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                return NextResponse.json(
                    { success: false, error: 'Failed to upload image' },
                    { status: 500 }
                );
            }
        }

        // Create new water intake entry
        const waterIntake = new WaterIntake({
            userId,
            amount,
            method,
            timestamp: new Date(),
            imageUrl
        });

        await waterIntake.save();

        return NextResponse.json({
            success: true,
            data: waterIntake
        });
    } catch (error) {
        console.error('Error adding water intake:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to add water intake' },
            { status: 500 }
        );
    }
}

// Update water intake goal
export async function PUT(request: NextRequest) {
    try {
        // Get token from cookies
        const token = request.cookies.get('nutritrack_auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify the token
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decodedToken.id;
        const { waterIntakeGoal } = await request.json();

        if (!waterIntakeGoal || waterIntakeGoal <= 0) {
            return NextResponse.json(
                { success: false, error: 'Valid water intake goal is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Update user's water intake goal
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { waterIntakeGoal },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                waterIntakeGoal: updatedUser.waterIntakeGoal
            }
        });
    } catch (error) {
        console.error('Error updating water intake goal:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update water intake goal' },
            { status: 500 }
        );
    }
}

// Delete a water intake entry
export async function DELETE(request: NextRequest) {
    try {
        // Get token from cookies
        const token = request.cookies.get('nutritrack_auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify the token
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decodedToken.id;
        const url = new URL(request.url);
        const entryId = url.searchParams.get('id');

        if (!entryId) {
            return NextResponse.json(
                { success: false, error: 'Entry ID is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Find and delete the entry
        const deletedEntry = await WaterIntake.findOneAndDelete({
            _id: entryId,
            userId: userId
        });

        if (!deletedEntry) {
            return NextResponse.json(
                { success: false, error: 'Entry not found or access denied' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { message: 'Entry deleted successfully' }
        });
    } catch (error) {
        console.error('Error deleting water intake entry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete entry' },
            { status: 500 }
        );
    }
}