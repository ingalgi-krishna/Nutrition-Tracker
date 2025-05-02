// src/lib/gemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API
const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// Safety settings for the Gemini model
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Function to analyze food image and extract nutritional information
export async function analyzeFoodImage(imageBase64: string): Promise<{
  foodName: string;
  nutrition: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
}> {
  try {
    // Get the Gemini Pro Vision model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      safetySettings,
    });

    // Prepare the image for the model
    const image = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
        mimeType: imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
      },
    };

    // Define the prompt for food analysis
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

    // Generate content using the model
    const result = await model.generateContent([prompt, image]);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    try {
      // Find JSON in the text (it might be surrounded by markdown code blocks)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
        text.match(/```\s*([\s\S]*?)\s*```/) ||
        [null, text];

      const jsonString = jsonMatch[1] || text;
      const data = JSON.parse(jsonString.trim());

      return {
        foodName: data.foodName,
        nutrition: {
          calories: Number(data.nutrition.calories),
          proteins: Number(data.nutrition.proteins),
          carbs: Number(data.nutrition.carbs),
          fats: Number(data.nutrition.fats),
        },
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Failed to parse nutritional information');
    }
  } catch (error) {
    console.error('Error analyzing food image with Gemini:', error);
    throw error;
  }
}
