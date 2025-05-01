// src/app/api/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import FoodEntry from '@/models/FoodEntry';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyToken } from '@/lib/jwt';
import { Types } from 'mongoose';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

    // Get user profile data including country and state
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate BMI category with null checks
    let bmiCategory = 'Not calculated';
    if (typeof user.bmi === 'number') {
      if (user.bmi < 18.5) bmiCategory = 'Underweight';
      else if (user.bmi < 25) bmiCategory = 'Normal weight';
      else if (user.bmi < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';
    }

    // Get today's food entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const foodEntries = await FoodEntry.find({
      userId,
      timestamp: { $gte: today, $lt: tomorrow }
    });

    // Calculate current nutrition totals
    const currentNutrition = foodEntries.reduce((totals, entry) => {
      totals.calories += entry.calories || 0;
      totals.proteins += entry.proteins || 0;
      totals.carbs += entry.carbs || 0;
      totals.fats += entry.fats || 0;
      return totals;
    }, { calories: 0, proteins: 0, carbs: 0, fats: 0 });

    // Format today's food for the prompt
    const formattedFoodEntries = foodEntries.map(entry => ({
      foodName: entry.foodName,
      mealTime: entry.mealType || 'unknown',
      calories: entry.calories,
      proteins: entry.proteins,
      carbs: entry.carbs,
      fats: entry.fats,
      timestamp: new Date(entry.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }));

    // Get current time to determine which meals should be recommended
    const currentHour = new Date().getHours();

    // Determine meal times based on current time
    let mealsToRecommend = [];
    if (currentHour < 10) mealsToRecommend.push('breakfast', 'lunch', 'dinner', 'snack');
    else if (currentHour < 14) mealsToRecommend.push('lunch', 'dinner', 'snack');
    else if (currentHour < 18) mealsToRecommend.push('dinner', 'snack');
    else mealsToRecommend.push('dinner');

    // Filter out meals that have already been logged
    const loggedMeals = new Set(foodEntries.map(entry => entry.mealType));
    mealsToRecommend = mealsToRecommend.filter(meal => !loggedMeals.has(meal));

    // Get region information from the user model - these fields should match what's in the User model
    const country = user.country || 'India'; // Default to India if not specified
    const state = user.state || 'Maharashtra'; // Default to Maharashtra if not specified

    // Prepare the prompt for Gemini based on region
    const prompt = `
  You are a nutrition expert AI assistant for an app called Kcalculate AI, specializing in personalized nutrition. You need to recommend personalized food options to the user based on their region, time of day, and health goals.
  
  USER PROFILE:
  - Height: ${user.height || 'Not specified'} cm
  - Weight: ${user.weight || 'Not specified'} kg
  - BMI: ${typeof user.bmi === 'number' ? user.bmi.toFixed(1) : 'Not calculated'} (${bmiCategory})
  - Goal: ${user.goalType || 'maintain'} (${user.goalType === 'weight_loss' ? 'Lose weight' : user.goalType === 'weight_gain' ? 'Gain weight' : 'Maintain weight'})
  - Dietary Preference: ${user.dietaryPreference || 'Not specified'}
  - Allergies: ${user.allergies && user.allergies.length > 0 ? user.allergies.join(', ') : 'None'}
  - Activity Level: ${user.activityLevel || 'Moderate'}
  - Age: ${user.age || 'Not specified'}
  - Gender: ${user.gender || 'Not specified'}
  - Country: ${country}
  - State/Region: ${state}
  
  TODAY'S FOOD ENTRIES (${today.toDateString()}):
  ${foodEntries.length > 0
        ? JSON.stringify(formattedFoodEntries, null, 2)
        : 'No food logged yet today.'
      }
  
  CURRENT NUTRITIONAL TOTALS:
  - Calories: ${currentNutrition.calories.toFixed(0)} kcal
  - Proteins: ${currentNutrition.proteins.toFixed(1)} g
  - Carbohydrates: ${currentNutrition.carbs.toFixed(1)} g
  - Fats: ${currentNutrition.fats.toFixed(1)} g
  
  MEALS TO RECOMMEND:
  Based on the current time, provide recommendations for the following meal types: ${mealsToRecommend.join(', ')}.

  Based on the user's profile, region (${country}, ${state}), dietary preferences, and what they've eaten today, provide personalized food recommendations that are both:
  1. Suitable for their health goals (${user.goalType || 'maintain'})
  2. Culturally appropriate for their region (${country}, ${state})
  3. Nutritionally balanced to complement what they've already eaten today
  
  IMPORTANT: All recommendations MUST be authentic regional dishes from ${country} ${state !== 'Maharashtra' ? `(specifically from ${state} if possible)` : ''}. Include traditional dishes popular in that region, but adjust them to meet the user's nutritional needs.
  
  For each meal type that needs to be recommended, provide 2-4 suitable food options. For example, if the user is from Maharashtra, India, include dishes like Misal Pav, Poha, etc. If from the Southern United States, include dishes like grilled chicken with collard greens, etc.
  
  Provide recommendations in the following JSON format:
  {
    "recommendations": [
      {
        "foodName": "Name of recommended regional dish",
        "mealTime": "breakfast|lunch|dinner|snack",
        "reason": "Brief explanation of why this food is recommended (must mention nutritional benefits and regional significance)",
        "isVegetarian": true|false,
        "description": "Brief description of the dish including traditional ingredients and preparation style",
        "nutrition": {
          "calories": number,
          "proteins": number,
          "carbs": number,
          "fats": number
        }
      },
      ...more recommendations
    ]
  }
  
  Return ONLY the valid JSON object, nothing else.
`;
    // Call Gemini API
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from potential markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
        text.match(/```\s*([\s\S]*?)\s*```/) ||
        [null, text];

      const jsonString = jsonMatch[1] || text;
      const recommendationsData = JSON.parse(jsonString.trim());

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id.toString(),
            name: user.name,
            bmi: user.bmi || 0,
            bmiCategory,
            goalType: user.goalType || 'maintain',
            dietaryPreference: user.dietaryPreference || 'Not specified',
            country: country,
            state: state
          },
          currentNutrition,
          todaysFoodEntries: formattedFoodEntries,
          recommendations: recommendationsData.recommendations,
          mealsToRecommend
        }
      });

    } catch (aiError) {
      console.error('Error generating recommendations with Gemini:', aiError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate recommendations' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// Configure to handle larger responses
export const maxDuration = 60; // Set max execution time (in seconds)
export const dynamic = 'force-dynamic'; // Ensures the route runs dynamically
export const runtime = 'nodejs'; // Ensures compatibility with Node.js environment