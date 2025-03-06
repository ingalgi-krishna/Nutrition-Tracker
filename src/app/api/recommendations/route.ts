import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectToDatabase from '@/lib/mongodb';
import User from '../../models/User';
import FoodEntry from '../../models/FoodEntry';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
    let totalCalories = 0;
    
    foodEntries.forEach(entry => {
      totalProteins += entry.proteins;
      totalCarbs += entry.carbs;
      totalFats += entry.fats;
      totalCalories += entry.calories;
    });
    
    const entryCount = foodEntries.length || 1; // Avoid division by zero
    
    const avgMacros = {
      proteins: Math.round(totalProteins / entryCount),
      carbs: Math.round(totalCarbs / entryCount),
      fats: Math.round(totalFats / entryCount),
      calories: Math.round(totalCalories / entryCount)
    };
    
    // Get BMI category
    const bmiCategory = user.bmi < 18.5 ? 'Underweight' : 
                      (user.bmi < 25 ? 'Normal weight' : 
                      (user.bmi < 30 ? 'Overweight' : 'Obese'));
    
    // Generate Indian food recommendations directly using Gemini
    const recommendations = await generateIndianFoodRecommendations(
      user.bmi, 
      bmiCategory,
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
            bmiCategory: bmiCategory,
            goalType: user.goalType,
          },
          currentNutrition: avgMacros,
          recommendations: recommendations
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

async function generateIndianFoodRecommendations(
  bmi: number, 
  bmiCategory: string,
  goalType: 'weight_gain' | 'weight_loss' | 'maintain',
  currentMacros: { proteins: number; carbs: number; fats: number; calories: number }
) {
  try {
    // Create a detailed prompt for the Gemini API
    const prompt = `
      I need personalized Indian food recommendations for a user with the following profile:
      - BMI: ${bmi} (${bmiCategory})
      - Goal: ${goalType === 'weight_gain' ? 'Weight Gain' : goalType === 'weight_loss' ? 'Weight Loss' : 'Maintain Weight'}
      - Current average daily intake: Protein: ${currentMacros.proteins}g, Carbs: ${currentMacros.carbs}g, Fats: ${currentMacros.fats}g, Calories: ${currentMacros.calories}

      Generate Indian food recommendations organized by meal type (breakfast, lunch, dinner, snack).
      For each meal type, provide TWO vegetarian options and TWO non-vegetarian options.
      
      For each food suggestion, include:
      1. Food name (in English and Hindi if applicable)
      2. A brief description of why it's suitable for the user's goal
      3. Approximate macronutrient content (proteins, carbs, fats, calories)
      
      ${goalType === 'weight_gain' ? 
        'Focus on calorie-dense, protein-rich Indian foods that can help with healthy weight gain.' : 
        goalType === 'weight_loss' ? 
        'Focus on low-calorie, high-protein, and fiber-rich Indian foods that promote satiety while creating a caloric deficit.' :
        'Focus on balanced Indian meals that maintain health while keeping calories neutral.'
      }
      
      ${currentMacros.proteins < 50 ? 'The user needs more protein-rich options. ' : ''}
      ${currentMacros.fats > 70 ? 'The user should reduce fat intake. ' : ''}
      
      Return your response directly as a JSON array with this structure:
      [
        {
          "foodName": "Name of dish",
          "reason": "Why it's suitable",
          "nutrition": {"proteins": X, "carbs": Y, "fats": Z, "calories": W},
          "mealTime": "breakfast|lunch|dinner|snack",
          "isVegetarian": true|false,
          "description": "Brief description of the dish"
        }
      ]
      
      DO NOT include any text outside the JSON array.
    `;

    // Call the Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response from Gemini
    try {
      // Try to extract JSON from the text (it might be wrapped in markdown code blocks)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                        text.match(/```\s*([\s\S]*?)\s*```/) || 
                        [null, text];
      
      const jsonString = jsonMatch[1] || text;
      return JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError, text);
      
      // Fallback to hardcoded recommendations if parsing fails
      return generateFallbackRecommendations(goalType);
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return generateFallbackRecommendations(goalType);
  }
}

// Fallback recommendations if the LLM fails
function generateFallbackRecommendations(goalType: 'weight_gain' | 'weight_loss' | 'maintain') {
  const fallbackRecommendations = [];
  
  if (goalType === 'weight_gain') {
    fallbackRecommendations.push(
      {
        foodName: "Paneer Paratha",
        reason: "High in protein and calories for healthy weight gain",
        nutrition: { proteins: 15, carbs: 30, fats: 18, calories: 350 },
        mealTime: "breakfast",
        isVegetarian: true,
        description: "Whole wheat flatbread stuffed with spiced cottage cheese"
      },
      {
        foodName: "Egg Paratha",
        reason: "Protein-rich breakfast option for muscle building",
        nutrition: { proteins: 14, carbs: 28, fats: 15, calories: 320 },
        mealTime: "breakfast",
        isVegetarian: false,
        description: "Whole wheat flatbread with eggs and spices"
      },
      {
        foodName: "Rajma Chawal",
        reason: "Complete protein with rice for balanced calorie intake",
        nutrition: { proteins: 12, carbs: 45, fats: 8, calories: 380 },
        mealTime: "lunch",
        isVegetarian: true,
        description: "Red kidney bean curry served with rice"
      }
    );
  } else if (goalType === 'weight_loss') {
    fallbackRecommendations.push(
      {
        foodName: "Moong Dal Chilla",
        reason: "High protein, low fat breakfast option",
        nutrition: { proteins: 10, carbs: 20, fats: 5, calories: 180 },
        mealTime: "breakfast",
        isVegetarian: true,
        description: "Savory pancakes made from split green gram batter"
      },
      {
        foodName: "Tandoori Chicken",
        reason: "High protein, low carb option for weight loss",
        nutrition: { proteins: 25, carbs: 5, fats: 10, calories: 250 },
        mealTime: "dinner",
        isVegetarian: false,
        description: "Chicken marinated in yogurt and spices, then grilled"
      },
      {
        foodName: "Vegetable Upma",
        reason: "Fiber-rich breakfast with moderate calories",
        nutrition: { proteins: 6, carbs: 25, fats: 7, calories: 200 },
        mealTime: "breakfast",
        isVegetarian: true,
        description: "Savory semolina porridge with vegetables and spices"
      }
    );
  } else {
    fallbackRecommendations.push(
      {
        foodName: "Idli Sambar",
        reason: "Balanced meal with protein and complex carbs",
        nutrition: { proteins: 8, carbs: 30, fats: 5, calories: 230 },
        mealTime: "breakfast",
        isVegetarian: true,
        description: "Steamed rice cakes served with lentil soup"
      },
      {
        foodName: "Fish Curry with Rice",
        reason: "Balanced protein and carbs for maintenance",
        nutrition: { proteins: 18, carbs: 35, fats: 10, calories: 350 },
        mealTime: "lunch",
        isVegetarian: false,
        description: "Fish cooked in a spiced gravy, served with rice"
      },
      {
        foodName: "Chana Masala",
        reason: "Protein and fiber rich vegetarian option",
        nutrition: { proteins: 10, carbs: 25, fats: 8, calories: 280 },
        mealTime: "dinner",
        isVegetarian: true,
        description: "Spiced chickpea curry"
      }
    );
  }
  
  return fallbackRecommendations;
}