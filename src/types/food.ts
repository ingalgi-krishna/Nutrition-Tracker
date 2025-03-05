// src/types/food.ts
export interface IFoodEntry {
  _id?: string;
  userId: string;
  foodName: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  imageUrl?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INutrition {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export interface IRecommendation {
  foodName: string;
  nutrition: INutrition;
  reason: string;
  mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}