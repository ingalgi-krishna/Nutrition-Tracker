// src/components/dashboard/BMRCard.tsx
'use client';

import React from 'react';
import { Flame, Activity, Dumbbell } from 'lucide-react';

interface BMRCardProps {
    bmr: number;
    tdee: number;
    activityMultiplier: number;
    activityLevel: string;
    goalType: string;
}

const BMRCard: React.FC<BMRCardProps> = ({
    bmr,
    tdee,
    activityMultiplier,
    activityLevel,
    goalType
}) => {
    // Format activity level for display
    const formatActivityLevel = (level: string): string => {
        switch (level) {
            case 'sedentary': return 'Sedentary (little to no exercise)';
            case 'light': return 'Light (exercise 1-3 days/week)';
            case 'moderate': return 'Moderate (exercise 3-5 days/week)';
            case 'active': return 'Active (exercise 6-7 days/week)';
            case 'very_active': return 'Very Active (intense exercise/physical job)';
            default: return level.charAt(0).toUpperCase() + level.slice(1);
        }
    };

    // Calculate calorie adjustment based on goal
    const goalAdjustment = goalType === 'weight_loss' ? -500 : goalType === 'weight_gain' ? 500 : 0;
    const goalText = goalType === 'weight_loss' ? 'deficit' : goalType === 'weight_gain' ? 'surplus' : 'maintenance';

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Flame className="mr-2 h-5 w-5 text-orange-500" />
                Metabolic Information
            </h2>

            <div className="space-y-6">
                <div>
                    <div className="flex items-center mb-2">
                        <Flame className="w-5 h-5 mr-2 text-orange-500" />
                        <h3 className="text-md font-medium text-gray-700">Basal Metabolic Rate (BMR)</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 ml-7">{bmr} <span className="text-sm font-normal text-gray-500">calories/day</span></p>
                    <p className="text-xs text-gray-500 ml-7 mt-1">
                        The calories your body needs while completely at rest
                    </p>
                </div>

                <div className="border-t pt-4">
                    <div className="flex items-center mb-2">
                        <Activity className="w-5 h-5 mr-2 text-blue-500" />
                        <h3 className="text-md font-medium text-gray-700">Total Daily Energy Expenditure (TDEE)</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 ml-7">{tdee} <span className="text-sm font-normal text-gray-500">calories/day</span></p>
                    <p className="text-xs text-gray-500 ml-7 mt-1">
                        Your BMR adjusted for activity level ({formatActivityLevel(activityLevel)})
                    </p>
                    <div className="ml-7 mt-2 bg-gray-100 p-2 rounded-md">
                        <p className="text-xs text-gray-700">
                            <span className="font-medium">Calculation:</span> BMR × {activityMultiplier.toFixed(2)} = {tdee} calories
                        </p>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex items-center mb-2">
                        <Dumbbell className="w-5 h-5 mr-2 text-green-500" />
                        <h3 className="text-md font-medium text-gray-700">Goal-Adjusted Calories</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 ml-7">{tdee + goalAdjustment} <span className="text-sm font-normal text-gray-500">calories/day</span></p>
                    <p className="text-xs text-gray-500 ml-7 mt-1">
                        Your recommended daily caloric intake for {goalType.replace('_', ' ')}
                    </p>
                    {goalAdjustment !== 0 && (
                        <div className="ml-7 mt-2 bg-gray-100 p-2 rounded-md">
                            <p className="text-xs text-gray-700">
                                <span className="font-medium">Adjustment:</span> TDEE {goalAdjustment > 0 ? '+' : ''}{goalAdjustment} calorie {goalText}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BMRCard;