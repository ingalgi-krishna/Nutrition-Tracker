// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET() {
  try {
    await connectToDatabase();
    
    const users = await User.find({}).select('-password');
    
    return NextResponse.json(
      { success: true, data: users },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, height, weight } = body;
    
    // Validate inputs
    if (!name || !email || !height || !weight) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already in use' },
        { status: 400 }
      );
    }
    
    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // Create user
    const user = new User({
      name,
      email,
      height,
      weight,
      bmi,
      goalType: bmi < 18.5 ? 'weight_gain' : (bmi > 25 ? 'weight_loss' : 'maintain'),
    });
    
    await user.save();
    
    return NextResponse.json(
      { 
        success: true, 
        data: { 
          id: user._id,
          name: user.name,
          email: user.email,
          bmi: user.bmi,
          goalType: user.goalType,
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

