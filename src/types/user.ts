// src/types/user.ts
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  onboardingCompleted: boolean;
}

export interface OnboardingData {
  height: number;
  weight: number;
  goalType: 'weight_loss' | 'weight_gain' | 'maintain';
  dietaryPreference: 'vegetarian' | 'non-vegetarian' | 'vegan';
  allergies: string[];
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  age: number;
  gender: 'male' | 'female' | 'other';
}