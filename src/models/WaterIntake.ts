// src/models/WaterIntake.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IWaterIntake extends Document {
    userId: mongoose.Types.ObjectId | string;
    amount: number; // In milliliters (ml)
    method: 'manual' | 'image' | 'camera'; // Method used to log the intake
    timestamp: Date;
    imageUrl?: string; // URL to the image (if applicable)
}

const WaterIntakeSchema = new Schema<IWaterIntake>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        method: {
            type: String,
            enum: ['manual', 'image', 'camera'],
            default: 'manual'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        imageUrl: {
            type: String
        }
    },
    { timestamps: true }
);

// Check if the model is already defined to prevent overwrite error in development
const WaterIntake = mongoose.models.WaterIntake as mongoose.Model<IWaterIntake> || mongoose.model<IWaterIntake>('WaterIntake', WaterIntakeSchema);

export default WaterIntake;