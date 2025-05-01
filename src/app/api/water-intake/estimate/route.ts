// src/app/api/water-intake/estimate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadImage } from '@/lib/cloudinary';
import User from '@/models/User';
import mongoose from 'mongoose';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

        const { image } = await request.json();

        if (!image) {
            return NextResponse.json(
                { success: false, error: 'No image provided' },
                { status: 400 }
            );
        }

        // Get user data for climate factors
        const user = await User.findById(new mongoose.Types.ObjectId(decodedToken.userId));
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Upload image to Cloudinary
        let cloudinaryUrl;
        try {
            const cloudinaryResult = await uploadImage(image);
            cloudinaryUrl = cloudinaryResult.url;
        } catch (uploadError) {
            console.error('Error uploading to Cloudinary:', uploadError);
            return NextResponse.json(
                { success: false, error: 'Failed to upload image' },
                { status: 500 }
            );
        }

        // Convert base64 to the format expected by Gemini
        const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const mimeType = image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

        // Prepare the image for Gemini API
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            },
        };

        // Get current date for seasonal information
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // 1-12 for Jan-Dec

        // Gather user contextual information
        const userContext = {
            country: user.country || 'Unknown',
            state: user.state || 'Unknown',
            activityLevel: user.activityLevel || 'moderate',
            age: user.age || 30,
            gender: user.gender || 'other',
            weight: user.weight || 70,
            currentMonth: currentMonth
        };

        // Prompt for Gemini to analyze the image and estimate water volume
        const prompt = `
      Analyze this image of a water container (glass, bottle, cup, etc.) and estimate the amount of water in milliliters (ml).
      
      Look for:
      1. The type of container (glass, mug, bottle, etc.)
      2. The approximate dimensions of the container
      3. How full the container is (e.g., half-full, 3/4 full)
      4. Any reference objects that could indicate scale
      
      Additionally, consider these contextual factors about the user:
      - Country: ${userContext.country}
      - State/Region: ${userContext.state}
      - Current month: ${userContext.currentMonth} (1-12 where 1=January)
      - Activity level: ${userContext.activityLevel}
      - Age: ${userContext.age}
      - Gender: ${userContext.gender}
      - Weight (kg): ${userContext.weight}
      
      Based on the image analysis, estimate the volume of water in milliliters (ml).
      
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
      
      Respond in this exact JSON format:
      {
        "containerType": "Type of container (e.g., glass, mug, bottle)",
        "fullnessLevel": "Description of how full the container is (e.g., half-full)",
        "estimatedVolume": number,
        "climateAdjustmentFactor": number,
        "adjustedRecommendation": number,
        "confidenceLevel": "high|medium|low",
        "reasoning": "Brief explanation of your volume estimation",
        "climateReasoning": "Brief explanation of the climate adjustment factor"
      }
      
      Only provide this JSON structure, no additional text.
    `;

        // Call the Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        let estimationData;
        try {
            // Extract JSON from the response
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                text.match(/```\s*([\s\S]*?)\s*```/) ||
                [null, text];

            const jsonString = jsonMatch[1] || text;
            estimationData = JSON.parse(jsonString.trim());
        } catch (parseError) {
            console.error('Error parsing Gemini response:', parseError, text);
            return NextResponse.json(
                { success: false, error: 'Failed to parse estimation data', rawResponse: text },
                { status: 500 }
            );
        }

        // Calculate daily intake recommendation based on adjusted factor
        const baseRecommendation = user.waterIntakeGoal || 2000; // Default 2L if not set
        const adjustedDailyRecommendation = Math.round(baseRecommendation * estimationData.climateAdjustmentFactor);

        return NextResponse.json({
            success: true,
            data: {
                ...estimationData,
                baseRecommendation,
                adjustedDailyRecommendation,
                imageUrl: cloudinaryUrl
            }
        });
    } catch (error) {
        console.error('Error estimating water volume:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to estimate water volume' },
            { status: 500 }
        );
    }
}

// Configure to handle larger payloads
export const maxDuration = 60; // Set max execution time (in seconds)
export const dynamic = 'force-dynamic'; // Ensures the route runs dynamically
export const runtime = 'nodejs'; // Ensures compatibility with Node.js environment