// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import FoodEntry, { IFoodEntry } from '@/models/FoodEntry';
import User, { IUser } from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { Types } from 'mongoose';

// Define interface for daily totals
interface DailyTotal {
  date: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  count: number;
}

// Define interface for food frequency
interface FoodFrequency {
  [key: string]: number;
}

// Define interface for top foods
interface TopFood {
  name: string;
  count: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

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

    // Parse date range params
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate') as string)
      : new Date(new Date().setDate(new Date().getDate() - 7)); // Default to last 7 days

    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate') as string)
      : new Date();

    // Add one day to include the end date
    endDate.setDate(endDate.getDate() + 1);

    await connectToDatabase();

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get food entries for the date range
    const foodEntries = await FoodEntry.find({
      userId,
      timestamp: { $gte: startDate, $lt: endDate }
    }).sort({ timestamp: 1 });

    // Calculate daily totals
    const dailyTotals: Record<string, DailyTotal> = {};

    foodEntries.forEach(entry => {
      const dateStr = new Date(entry.timestamp).toISOString().split('T')[0];

      if (!dailyTotals[dateStr]) {
        dailyTotals[dateStr] = {
          date: dateStr,
          calories: 0,
          proteins: 0,
          carbs: 0,
          fats: 0,
          count: 0
        };
      }

      dailyTotals[dateStr].calories += entry.calories || 0;
      dailyTotals[dateStr].proteins += entry.proteins || 0;
      dailyTotals[dateStr].carbs += entry.carbs || 0;
      dailyTotals[dateStr].fats += entry.fats || 0;
      dailyTotals[dateStr].count += 1;
    });

    // Calculate overall totals and averages
    const dailyTotalsArray = Object.values(dailyTotals);

    const totalDays = dailyTotalsArray.length;
    const overall = {
      totalEntries: foodEntries.length,
      totalDays,
      averageCaloriesPerDay: 0,
      averageProteinsPerDay: 0,
      averageCarbsPerDay: 0,
      averageFatsPerDay: 0,
      totalCalories: 0,
      totalProteins: 0,
      totalCarbs: 0,
      totalFats: 0
    };

    if (totalDays > 0) {
      dailyTotalsArray.forEach((day: DailyTotal) => {
        overall.totalCalories += day.calories;
        overall.totalProteins += day.proteins;
        overall.totalCarbs += day.carbs;
        overall.totalFats += day.fats;
      });

      overall.averageCaloriesPerDay = overall.totalCalories / totalDays;
      overall.averageProteinsPerDay = overall.totalProteins / totalDays;
      overall.averageCarbsPerDay = overall.totalCarbs / totalDays;
      overall.averageFatsPerDay = overall.totalFats / totalDays;
    }

    // Get today's entries for current macros
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEntries = await FoodEntry.find({
      userId,
      timestamp: { $gte: today, $lt: tomorrow }
    });

    const todayMacros = {
      calories: 0,
      proteins: 0,
      carbs: 0,
      fats: 0
    };

    todayEntries.forEach(entry => {
      todayMacros.calories += entry.calories || 0;
      todayMacros.proteins += entry.proteins || 0;
      todayMacros.carbs += entry.carbs || 0;
      todayMacros.fats += entry.fats || 0;
    });

    // Calculate macro breakdown for the whole period
    const macroBreakdown = {
      proteins: overall.totalCalories > 0 ? (overall.totalProteins * 4 / overall.totalCalories) * 100 : 0,
      carbs: overall.totalCalories > 0 ? (overall.totalCarbs * 4 / overall.totalCalories) * 100 : 0,
      fats: overall.totalCalories > 0 ? (overall.totalFats * 9 / overall.totalCalories) * 100 : 0
    };

    // Get top 5 most logged foods
    const foodFrequency: FoodFrequency = {};
    foodEntries.forEach(entry => {
      if (!foodFrequency[entry.foodName]) {
        foodFrequency[entry.foodName] = 0;
      }
      foodFrequency[entry.foodName] += 1;
    });

    const topFoods: TopFood[] = Object.entries(foodFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id.toString(),
          name: user.name,
          bmi: user.bmi || null,
          height: user.height || null,
          weight: user.weight || null,
          goalType: user.goalType || 'maintain'
        },
        dailyTotals: dailyTotalsArray,
        overall,
        todayMacros,
        macroBreakdown,
        topFoods,
        // Calculate recommended macros based on user data
        recommendedMacros: calculateRecommendedMacros(user)
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// Helper function to calculate recommended macros based on user profile
function calculateRecommendedMacros(user: IUser) {
  // Default values if user data is incomplete
  let bmr = 1800; // Base Metabolic Rate - calories needed at rest
  let activityMultiplier = 1.3; // Lightly active

  if (user.weight && user.height && user.age && user.gender) {
    // Mifflin-St Jeor Equation for BMR
    if (user.gender === 'male') {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
    } else {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
    }

    // Set activity multiplier based on activity level
    switch (user.activityLevel) {
      case 'sedentary': activityMultiplier = 1.2; break;
      case 'light': activityMultiplier = 1.375; break;
      case 'moderate': activityMultiplier = 1.55; break;
      case 'active': activityMultiplier = 1.725; break;
      case 'very_active': activityMultiplier = 1.9; break;
      default: activityMultiplier = 1.3;
    }
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  let tdee = bmr * activityMultiplier;

  // Adjust for goal
  let calorieGoal = tdee;
  if (user.goalType === 'weight_loss') {
    calorieGoal = tdee - 500; // 500 calorie deficit
  } else if (user.goalType === 'weight_gain') {
    calorieGoal = tdee + 500; // 500 calorie surplus
  }

  // Macros distribution (40% carbs, 30% protein, 30% fat)
  const proteinGoal = (calorieGoal * 0.3) / 4; // 1g protein = 4 calories
  const carbGoal = (calorieGoal * 0.4) / 4;    // 1g carb = 4 calories
  const fatGoal = (calorieGoal * 0.3) / 9;     // 1g fat = 9 calories

  return {
    calories: Math.round(calorieGoal),
    proteins: Math.round(proteinGoal),
    carbs: Math.round(carbGoal),
    fats: Math.round(fatGoal),
    bmr: Math.round(bmr),                   // Added BMR
    tdee: Math.round(tdee),                 // Added TDEE
    activityMultiplier,                     // Added activity multiplier
    goalAdjustment: user.goalType === 'weight_loss' ? -500 :
      user.goalType === 'weight_gain' ? 500 : 0  // Added goal adjustment
  };
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';