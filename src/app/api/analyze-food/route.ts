// src/app/api/analyze-food/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDatabase } from '@/lib/mongodb';
import FoodEntry from '@/models/FoodEntry';
import { uploadImage } from '@/lib/cloudinary';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper function for fallback nutrition estimation
async function estimateNutrition(foodName: string) {
    try {
        // Make a specific call to Gemini for nutrition information
        const nutritionPrompt = `
      I need the average nutritional information for one serving of "${foodName}".
      Please provide only the numerical values for:
      - Calories (kcal)
      - Proteins (grams)
      - Carbohydrates (grams)
      - Fats (grams)
      
      Return ONLY a JSON object in this exact format:
      {
        "calories": number,
        "proteins": number,
        "carbs": number,
        "fats": number
      }
    `;

        const nutritionModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const nutritionResult = await nutritionModel.generateContent(nutritionPrompt);
        const nutritionResponse = await nutritionResult.response;
        const nutritionText = nutritionResponse.text();

        // Extract JSON from the response
        const jsonMatch = nutritionText.match(/```json\s*([\s\S]*?)\s*```/) ||
            nutritionText.match(/```\s*([\s\S]*?)\s*```/) ||
            [null, nutritionText];

        const jsonString = jsonMatch[1] || nutritionText;
        return JSON.parse(jsonString.trim());
    } catch (error) {
        console.error('Error in fallback nutrition estimation:', error);
        // Return default values if estimation fails
        return {
            calories: 200,
            proteins: 10,
            carbs: 20,
            fats: 8
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image, userId } = body;

        if (!image) {
            return NextResponse.json(
                { success: false, error: 'No image provided' },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId is required' },
                { status: 400 }
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

        // Enhanced prompt for better nutritional information extraction
        const prompt = `
      Analyze this food image and provide the following information:
      1. The exact name of the food item you see in the image
      2. Detailed nutritional information per serving including:
         - Calories (kcal)
         - Proteins (in grams)
         - Carbohydrates (in grams)
         - Fats (in grams)
      
      It's CRITICAL that you return BOTH the food name AND numerical values for all nutritional information.
      
      Respond in this exact JSON format without any deviation:
      {
        "foodName": "Name of the food",
        "nutrition": {
          "calories": number,
          "proteins": number,
          "carbs": number,
          "fats": number
        }
      }
      
      Example of correctly formatted response:
      {
        "foodName": "Chicken Caesar Salad",
        "nutrition": {
          "calories": 350,
          "proteins": 25,
          "carbs": 10,
          "fats": 18
        }
      }
      
      Only provide this JSON structure with real numerical values, no text or explanations.
    `;

        // Call the Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response from Gemini with improved error handling
        let foodData;
        try {
            // Try to extract JSON from the text (it might be wrapped in markdown code blocks)
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                text.match(/```\s*([\s\S]*?)\s*```/) ||
                [null, text];

            const jsonString = jsonMatch[1] || text;
            foodData = JSON.parse(jsonString.trim());

            // Check if nutrition data is missing or incomplete
            if (!foodData.nutrition ||
                foodData.nutrition.calories === undefined ||
                foodData.nutrition.proteins === undefined ||
                foodData.nutrition.carbs === undefined ||
                foodData.nutrition.fats === undefined) {

                console.log('Nutrition data incomplete, using fallback estimation for:', foodData.foodName);

                // Use fallback estimation based on the food name
                const fallbackNutrition = await estimateNutrition(foodData.foodName);

                // Create or update the nutrition object
                foodData.nutrition = {
                    calories: fallbackNutrition.calories,
                    proteins: fallbackNutrition.proteins,
                    carbs: fallbackNutrition.carbs,
                    fats: fallbackNutrition.fats
                };
            }
        } catch (parseError) {
            console.error('Error parsing Gemini response:', parseError, text);

            // Extract just the food name if possible
            let foodName = "Unknown Food";
            try {
                // Try to find a food name in the response
                const nameMatch = text.match(/"foodName":\s*"([^"]+)"/);
                if (nameMatch && nameMatch[1]) {
                    foodName = nameMatch[1];
                }

                // Use fallback estimation based on the extracted food name
                const fallbackNutrition = await estimateNutrition(foodName);

                foodData = {
                    foodName: foodName,
                    nutrition: fallbackNutrition
                };
            } catch (fallbackError) {
                return NextResponse.json(
                    { success: false, error: 'Failed to parse nutritional information', rawResponse: text },
                    { status: 500 }
                );
            }
        }

        // Return analysis results without saving to DB (this avoids duplicate entries)
        return NextResponse.json(
            {
                success: true,
                data: {
                    userId,
                    foodName: foodData.foodName,
                    nutrition: foodData.nutrition,
                    imageUrl: cloudinaryUrl // Return the Cloudinary URL
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error processing image:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process image' },
            { status: 500 }
        );
    }
}

// Configure to handle larger payloads
export const maxDuration = 60; // Optional: Set max execution time (in seconds)
export const dynamic = 'force-dynamic'; // Ensures the route runs dynamically
export const runtime = 'nodejs'; // Ensures compatibility with Node.js environment