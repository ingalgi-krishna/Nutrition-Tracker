// src/app/api/analyze-food/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDatabase } from '@/lib/mongodb';
import FoodEntry from '@/models/FoodEntry';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const body = await req.json();
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

        // Prepare the prompt for food analysis
        const prompt = `
      Analyze this food image and provide the following information:
      1. The name of the food item
      2. Nutritional information per serving including:
         - Calories
         - Proteins (in grams)
         - Carbohydrates (in grams)
         - Fats (in grams)
      
      Respond in a structured JSON format like this:
      {
        "foodName": "Name of the food",
        "nutrition": {
          "calories": number,
          "proteins": number,
          "carbs": number,
          "fats": number
        }
      }
      
      Only provide this JSON structure, no other text.
    `;

        // Call the Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response from Gemini
        let foodData;
        try {
            // Try to extract JSON from the text (it might be wrapped in markdown code blocks)
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                text.match(/```\s*([\s\S]*?)\s*```/) ||
                [null, text];

            const jsonString = jsonMatch[1] || text;
            foodData = JSON.parse(jsonString.trim());
        } catch (parseError) {
            console.error('Error parsing Gemini response:', parseError, text);
            return NextResponse.json(
                { success: false, error: 'Failed to parse nutritional information', rawResponse: text },
                { status: 500 }
            );
        }

        // Return the analysis results
        return NextResponse.json(
            {
                success: true,
                data: {
                    foodName: foodData.foodName,
                    calories: foodData.nutrition.calories,
                    proteins: foodData.nutrition.proteins,
                    carbs: foodData.nutrition.carbs,
                    fats: foodData.nutrition.fats,
                    imageUrl: image, // Return the image for preview
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