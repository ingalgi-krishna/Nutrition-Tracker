
// src/app/api/upload-image/route.ts
import { NextResponse } from 'next/server';
import { analyzeFoodImage } from '@/lib/gemini';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, userId } = body;
    
    if (!imageBase64) {
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

    // Analyze the image using Gemini Vision API
    const foodAnalysis = await analyzeFoodImage(imageBase64);
    
    // Here you would normally save the image to a storage service
    // For simplicity, we'll just return the analysis results
    // In a real app, you would save the image URL and create a food entry
    
    return NextResponse.json(
      { 
        success: true, 
        data: {
          userId,
          ...foodAnalysis,
          // You would include the image URL here after uploading
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