// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  height?: number;
  weight?: number;
  bmi?: number;
  goalType?: 'weight_loss' | 'weight_gain' | 'maintain' | 'muscle_gain' | 'improve_health';
  dietaryPreference?: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo';
  allergies?: string[];
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  country?: string; // New field for country
  state?: string;   // New field for state/province
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    height: { type: Number },
    weight: { type: Number },
    bmi: { type: Number },
    goalType: {
      type: String,
      enum: ['weight_loss', 'weight_gain', 'maintain', 'muscle_gain', 'improve_health']
    },
    dietaryPreference: {
      type: String,
      enum: ['vegetarian', 'non-vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo']
    },
    allergies: [{ type: String }],
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active']
    },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    country: { type: String }, // New field
    state: { type: String },   // New field
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if the model is already defined to prevent overwrite error in development
const User = mongoose.models.User as mongoose.Model<IUser> || mongoose.model<IUser>('User', UserSchema);

export default User;