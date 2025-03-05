
// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '../../../models/User';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    await connectToDatabase();
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
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
    const userId = params.id;
    const body = await req.json();
    
    await connectToDatabase();
    
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    const { name, email, height, weight } = body;
    
    if (name) user.name = name;
    if (email) user.email = email;
    
    // Recalculate BMI if height or weight changes
    if (height || weight) {
      if (height) user.height = height;
      if (weight) user.weight = weight;
      user.calculateBMI();
      
      // Update goal type based on BMI
      user.goalType = user.bmi < 18.5 ? 'weight_gain' : (user.bmi > 25 ? 'weight_loss' : 'maintain');
    }
    
    await user.save();
    
    return NextResponse.json(
      { success: true, data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
