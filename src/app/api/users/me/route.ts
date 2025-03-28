import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    // Get token from cookies
    const cookies = req.headers.get('cookie');
    const tokenCookie = cookies?.split(';').find(c => c.trim().startsWith('auth_token='));
    const token = tokenCookie?.split('=')[1];
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const { userId } = decoded;
    
    await connectToDatabase();
    
    // Find the user
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          height: user.height,
          weight: user.weight,
          bmi: user.bmi,
          goalType: user.goalType,
          dietaryPreference: user.dietaryPreference,
          allergies: user.allergies,
          activityLevel: user.activityLevel,
          age: user.age,
          gender: user.gender,
          onboardingCompleted: user.onboardingCompleted
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    // Get token from cookies
    const cookies = req.headers.get('cookie');
    const tokenCookie = cookies?.split(';').find(c => c.trim().startsWith('auth_token='));
    const token = tokenCookie?.split('=')[1];
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const { userId } = decoded;
    const updateData = await req.json();
    
    await connectToDatabase();
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user fields
    const {
      name,
      email,
      height,
      weight,
      age,
      gender,
      dietaryPreference,
      activityLevel,
      allergies
    } = updateData;
    
    if (name) user.name = name;
    if (email) user.email = email;
    
    // Update physical measurements and recalculate BMI if needed
    let bmiUpdated = false;
    if (height !== undefined) {
      user.height = height;
      bmiUpdated = true;
    }
    if (weight !== undefined) {
      user.weight = weight;
      bmiUpdated = true;
    }
    
    // Recalculate BMI if height or weight changed
    if (bmiUpdated && user.height && user.weight) {
      user.calculateBMI();
      
      // Update goal type based on BMI
      if (user.bmi < 18.5) {
        user.goalType = 'weight_gain';
      } else if (user.bmi > 25) {
        user.goalType = 'weight_loss';
      } else {
        user.goalType = 'maintain';
      }
    }
    
    // Update other fields
    if (age !== undefined) user.age = age;
    if (gender) user.gender = gender;
    if (dietaryPreference) user.dietaryPreference = dietaryPreference;
    if (activityLevel) user.activityLevel = activityLevel;
    if (allergies) user.allergies = allergies;
    
    // Mark as onboarded if essential fields are filled
    if (user.height && user.weight && user.bmi) {
      user.onboardingCompleted = true;
    }
    
    await user.save();
    
    return NextResponse.json(
      { 
        success: true, 
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          height: user.height,
          weight: user.weight,
          bmi: user.bmi,
          goalType: user.goalType,
          dietaryPreference: user.dietaryPreference,
          allergies: user.allergies,
          activityLevel: user.activityLevel,
          age: user.age,
          gender: user.gender,
          onboardingCompleted: user.onboardingCompleted
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}