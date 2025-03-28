// src/app/api/food-entries/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import FoodEntry from '@/models/FoodEntry';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Get userId from query params
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Parse date filters
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate') as string)
      : new Date(new Date().setDate(new Date().getDate() - 7)); // Default to last 7 days

    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate') as string)
      : new Date();

    // Add one day to end date to include entries from the end date
    endDate.setDate(endDate.getDate() + 1);

    await connectToDatabase();

    const entries = await FoodEntry.find({
      userId,
      timestamp: { $gte: startDate, $lt: endDate },
    }).sort({ timestamp: -1 });

    return NextResponse.json(
      { success: true, data: entries },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching food entries:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, foodName, calories, proteins, carbs, fats, imageUrl, timestamp } = body;

    // Validate input
    if (!userId || !foodName || calories == null || proteins == null || carbs == null || fats == null) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const foodEntry = new FoodEntry({
      userId,
      foodName,
      calories,
      proteins,
      carbs,
      fats,
      imageUrl,
      timestamp: timestamp || new Date(),
    });

    await foodEntry.save();

    return NextResponse.json(
      { success: true, data: foodEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating food entry:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}