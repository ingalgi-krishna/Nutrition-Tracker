// src/app/api/recommendations/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '../../models/User';
import FoodEntry from '../../models/FoodEntry';
import { generateRecommendations } from '@/lib/bmi';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Get user information
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get recent food entries to analyze current nutrition
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const foodEntries = await FoodEntry.find({
      userId,
      timestamp: { $gte: lastWeek, $lte: today }
    });
    
    // Calculate average macros from recent entries
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    
    foodEntries.forEach(entry => {
      totalProteins += entry.proteins;
      totalCarbs += entry.carbs;
      totalFats += entry.fats;
    });
    
    const entryCount = foodEntries.length || 1; // Avoid division by zero
    
    const avgMacros = {
      proteins: Math.round(totalProteins / entryCount),
      carbs: Math.round(totalCarbs / entryCount),
      fats: Math.round(totalFats / entryCount)
    };
    
    // Generate food recommendations
    const recommendations = generateRecommendations(
      user.bmi,
      user.goalType as 'weight_gain' | 'weight_loss' | 'maintain',
      avgMacros
    );
    
    return NextResponse.json(
      { 
        success: true, 
        data: {
          user: {
            id: user._id,
            name: user.name,
            bmi: user.bmi,
            bmiCategory: user.bmi < 18.5 ? 'Underweight' : (user.bmi < 25 ? 'Normal weight' : (user.bmi < 30 ? 'Overweight' : 'Obese')),
            goalType: user.goalType,
          },
          currentNutrition: avgMacros,
          recommendations
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}