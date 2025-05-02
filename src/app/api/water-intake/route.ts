// src/app/api/water-intake/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import WaterIntake from '@/models/WaterIntake';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { uploadImage } from '@/lib/cloudinary';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper function to get climate adjustment using Gemini
const getClimateAdjustment = async (user: any) => {
    try {
        if (!user.country) {
            return {
                factor: 1.0,
                reason: "No location data available for climate adjustment"
            };
        }

        // Get current date for seasonal information
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // 1-12 for Jan-Dec

        // Prepare user context for Gemini
        const userContext = {
            country: user.country || 'Unknown',
            state: user.state || 'Unknown',
            activityLevel: user.activityLevel || 'moderate',
            age: user.age || 30,
            gender: user.gender || 'other',
            weight: user.weight || 70,
            currentMonth: currentMonth,
            monthName: currentDate.toLocaleString('default', { month: 'long' })
        };

        // Create prompt for Gemini
        const prompt = `
      Based on the following user information, calculate a climate adjustment factor for daily water intake:
      
      - Country: ${userContext.country}
      - State/Region: ${userContext.state}
      - Current month: ${userContext.monthName} (month #${userContext.currentMonth})
      - Activity level: ${userContext.activityLevel}
      - Age: ${userContext.age}
      - Gender: ${userContext.gender}
      - Weight: ${userContext.weight} kg
      
      First, determine if the user is in the Northern or Southern Hemisphere based on their country.
      
      Then, calculate a climate adjustment factor (from 0.8 to 1.5) based on:
      1. The user's location and current month
      2. The typical climate for that region during this time of year
      3. Whether it's summer or winter in their hemisphere
      4. The user's activity level
      
      For example:
      - Hot climates during summer months should have higher adjustment factors (1.2-1.5)
      - Cold climates during winter months should have lower adjustment factors (0.8-1.0)
      - Temperate climates should have moderate adjustment factors (1.0-1.2)
      - Higher activity levels increase the adjustment factor
      
      Only respond in this exact JSON format:
      {
        "hemisphere": "Northern|Southern",
        "season": "summer|winter|spring|fall",
        "climateAdjustmentFactor": number,
        "reason": "Brief explanation of the climate adjustment factor"
      }
    `;

        // Call Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        try {
            // Extract JSON from the response
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                text.match(/```\s*([\s\S]*?)\s*```/) ||
                [null, text];

            const jsonString = jsonMatch[1] || text;
            const climateData = JSON.parse(jsonString.trim());

            return {
                factor: climateData.climateAdjustmentFactor || 1.0,
                hemisphere: climateData.hemisphere || "Unknown",
                season: climateData.season || "Unknown",
                reason: climateData.reason || "Based on your location and current season"
            };
        } catch (parseError) {
            console.error('Error parsing climate data:', parseError);
            return {
                factor: 1.0,
                hemisphere: "Unknown",
                season: "Unknown",
                reason: "Could not determine climate adjustment"
            };
        }
    } catch (error) {
        console.error('Error calculating climate adjustment with Gemini:', error);
        return {
            factor: 1.0,
            hemisphere: "Unknown",
            season: "Unknown",
            reason: "Error calculating climate adjustment"
        };
    }
};

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

        // Get query parameters
        const url = new URL(request.url);
        const startDateParam = url.searchParams.get('startDate');
        const endDateParam = url.searchParams.get('endDate');

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
                    default:
                        break;
                }
            }

            // Set minimum and maximum bounds
            recommendedIntake = Math.max(1500, Math.min(4000, recommendedIntake));
        }

        // Use user's set goal or the calculated recommendation
        const waterIntakeGoal = user.waterIntakeGoal || recommendedIntake;

        // Define date range - default to today
        let startDate, endDate;

        if (startDateParam && endDateParam) {
            // Custom date range
            startDate = new Date(startDateParam);
            endDate = new Date(endDateParam);
            endDate.setHours(23, 59, 59, 999); // Include full end day
        } else {
            // Today only (default)
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        }

        // Get water intake entries
        const waterIntakes = await WaterIntake.find({
            userId,
            timestamp: { $gte: startDate, $lte: endDate }
        }).sort({ timestamp: -1 }); // Newest first

        // Calculate total intake
        const totalIntake = waterIntakes.reduce((sum, entry) => sum + entry.amount, 0);
        const progress = Math.min(Math.round((totalIntake / waterIntakeGoal) * 100), 100);

        // Get climate adjustment using Gemini
        const { factor: climateAdjustmentFactor, reason: climateReason, hemisphere, season } = await getClimateAdjustment(user);

        // Calculate adjusted recommendation
        const adjustedRecommendation = Math.round(waterIntakeGoal * climateAdjustmentFactor);

        // Current month name
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });

        return NextResponse.json({
            success: true,
            data: {
                entries: waterIntakes,
                totalIntake,
                waterIntakeGoal,
                recommendedIntake,
                progress,
                unit: 'ml',
                weight: user.weight || null,
                climateAdjustmentFactor,
                climateReason,
                adjustedRecommendation,
                hemisphere,
                season,
                month: currentMonth
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

// Add water intake entry
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
        const { amount, method = 'manual', image = null, timestamp = new Date() } = await request.json();

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
            timestamp: new Date(timestamp),
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

// Delete a water intake entry - this is now handled by the [id] route
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