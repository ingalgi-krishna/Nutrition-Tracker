// src/app/api/analyze-food/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDatabase } from '@/lib/mongodb';
import FoodEntry from '@/models/FoodEntry';
import { uploadImage } from '@/lib/cloudinary';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper function for fallback nutrition estimation
async function estimateNutrition(foodName: string, servingSize: string = "standard") {
    try {
        // Make a specific call to Gemini for nutrition information with serving size
        const nutritionPrompt = `
      I need the average nutritional information for ${servingSize} serving of "${foodName}".
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
        "fats": number,
        "servingSize": "description of the serving size"
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
            fats: 8,
            servingSize: "standard portion"
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

        // Enhanced prompt for better serving size estimation and nutritional information extraction
        const prompt = `
      Analyze this food image in detail and provide the following information:
      
      1. The exact name of the food item(s) visible in the image
      
      2. SERVING SIZE ANALYSIS:
         - Estimate the serving size based on visual cues (plate/bowl size, utensils, or other objects for scale)
         - Also Count the number of food items (e.g., "2 slices of pizza", "1 bowl of salad", "2 Apples", "Two Donuts")
         - Compare food portions to standard reference objects if visible (e.g., "size of a fist", "standard dinner plate")
         - Identify volume or weight indicators (approx. grams, cups, tablespoons, etc.)
         - Note if it appears to be a restaurant portion (typically larger) or home-prepared
         - If multiple food items are present, analyze each component separately
      
      3. Detailed nutritional information for the SPECIFIC serving size you identified:
         - Calories (kcal)
         - Proteins (in grams)
         - Carbohydrates (in grams)
         - Fats (in grams)
      
      It's CRITICAL that you return numerical values for ALL nutritional information calibrated to the specific serving size you identified.
      
      Respond in this exact JSON format:
      {
        "foodName": "Name of the food",
        "servingAnalysis": {
          "estimatedSize": "Detailed description of the estimated serving size",
          "visualReferences": "Objects or indicators used for size comparison",
          "portionType": "restaurant/home-cooked/packaged",
          "approximateWeight": "Estimated weight in grams if possible"
        },
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
        "servingAnalysis": {
          "estimatedSize": "Medium dinner plate, approximately 2 cups of salad",
          "visualReferences": "Fork visible in image indicates restaurant-sized portion",
          "portionType": "restaurant",
          "approximateWeight": "350 grams"
        },
        "nutrition": {
          "calories": 350,
          "proteins": 25,
          "carbs": 10,
          "fats": 18
        }
      }
      
      Only provide this JSON structure with real numerical values, no additional text or explanations.
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

                // Get serving size info if available
                const servingSizeDesc = foodData.servingAnalysis?.estimatedSize || "standard";

                // Use fallback estimation based on the food name and serving size
                const fallbackNutrition = await estimateNutrition(foodData.foodName, servingSizeDesc);

                // Create or update the nutrition object
                foodData.nutrition = {
                    calories: fallbackNutrition.calories,
                    proteins: fallbackNutrition.proteins,
                    carbs: fallbackNutrition.carbs,
                    fats: fallbackNutrition.fats
                };
            }

            // Ensure servingAnalysis exists even if missing in response
            if (!foodData.servingAnalysis) {
                foodData.servingAnalysis = {
                    estimatedSize: "Standard portion",
                    visualReferences: "Not available",
                    portionType: "unknown",
                    approximateWeight: "Unknown"
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
                    servingAnalysis: {
                        estimatedSize: "Standard portion",
                        visualReferences: "Not available",
                        portionType: "unknown",
                        approximateWeight: "Unknown"
                    },
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
                    servingAnalysis: foodData.servingAnalysis,
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