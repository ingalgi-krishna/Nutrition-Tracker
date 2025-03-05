import mongoose, { Schema, Model } from 'mongoose';

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

const FoodEntrySchema = new Schema<IFoodEntry>(
  {
    userId: { 
      type: String, 
      required: true,
      ref: 'User'
    },
    foodName: { 
      type: String, 
      required: true 
    },
    calories: { 
      type: Number, 
      required: true 
    },
    proteins: { 
      type: Number, 
      required: true 
    },
    carbs: { 
      type: Number, 
      required: true 
    },
    fats: { 
      type: Number, 
      required: true 
    },
    imageUrl: { 
      type: String
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
  },
  { 
    timestamps: true 
  }
);

// Add indexes for better query performance
FoodEntrySchema.index({ userId: 1, timestamp: -1 });

// Create FoodEntry model or use existing one
const FoodEntry = mongoose.models.FoodEntry || mongoose.model<IFoodEntry>('FoodEntry', FoodEntrySchema);

export default FoodEntry;