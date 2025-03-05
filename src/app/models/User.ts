import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  height: number;
  weight: number;
  bmi: number;
  goalType: 'weight_loss' | 'weight_gain' | 'maintain';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    height: { 
      type: Number, 
      required: true 
    }, // in cm
    weight: { 
      type: Number, 
      required: true 
    }, // in kg
    bmi: { 
      type: Number, 
      required: true 
    },
    goalType: { 
      type: String, 
      enum: ['weight_loss', 'weight_gain', 'maintain'], 
      default: 'maintain' 
    },
  },
  { 
    timestamps: true 
  }
);

// Add method to calculate BMI
UserSchema.methods.calculateBMI = function() {
  // Convert height from cm to meters
  const heightInMeters = this.height / 100;
  this.bmi = this.weight / (heightInMeters * heightInMeters);
  return this.bmi;
};

// Create User model or use existing one
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;