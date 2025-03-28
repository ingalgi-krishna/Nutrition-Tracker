// src/app/api/food-entries/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import FoodEntry from '@/models/FoodEntry';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entryId = params.id;

    await connectToDatabase();

    const entry = await FoodEntry.findById(entryId);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Food entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: entry },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching food entry:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entryId = params.id;
    const body = await req.json();

    await connectToDatabase();

    const entry = await FoodEntry.findById(entryId);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Food entry not found' },
        { status: 404 }
      );
    }

    // Update fields
    const { foodName, calories, proteins, carbs, fats, imageUrl, timestamp } = body;

    if (foodName) entry.foodName = foodName;
    if (calories != null) entry.calories = calories;
    if (proteins != null) entry.proteins = proteins;
    if (carbs != null) entry.carbs = carbs;
    if (fats != null) entry.fats = fats;
    if (imageUrl) entry.imageUrl = imageUrl;
    if (timestamp) entry.timestamp = new Date(timestamp);

    await entry.save();

    return NextResponse.json(
      { success: true, data: entry },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating food entry:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entryId = params.id;

    await connectToDatabase();

    const entry = await FoodEntry.findByIdAndDelete(entryId);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Food entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { message: 'Food entry deleted successfully' } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting food entry:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}