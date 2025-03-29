// src/components/dashboard/BMRCard.tsx
'use client';

import React from 'react';
import { Flame, Activity, Dumbbell, Heart, Info } from 'lucide-react';
import { motion } from 'framer-motion';

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

    // Get color based on goal type
    const getGoalColor = () => {
        switch (goalType) {
            case 'weight_loss': return 'text-blue-500';
            case 'weight_gain': return 'text-[#FC842D]';
            case 'maintain': return 'text-[#8BAA7C]';
            default: return 'text-[#8BAA7C]';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-[#ABD483]/20 font-['DM_Sans']"
        >
            <div className="flex items-center mb-5">
                <div className="w-10 h-10 rounded-full bg-[#ABD483]/10 flex items-center justify-center mr-3">
                    <Flame className="h-5 w-5 text-[#FC842D]" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-[#010100]">Metabolic Information</h2>
                    <p className="text-xs text-gray-500">Your daily energy expenditure and calorie needs</p>
                </div>
            </div>

            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="bg-gradient-to-r from-[#ABD483]/5 to-[#8BAA7C]/5 rounded-lg p-4 border border-[#ABD483]/10"
                >
                    <div className="flex items-center mb-2">
                        <Flame className="w-5 h-5 mr-2 text-[#FC842D]" />
                        <h3 className="text-md font-medium text-[#010100]">Basal Metabolic Rate (BMR)</h3>
                    </div>
                    <p className="text-2xl font-bold text-[#010100] ml-7">{bmr.toLocaleString()} <span className="text-sm font-normal text-gray-500">calories/day</span></p>
                    <p className="text-xs text-gray-600 ml-7 mt-1">
                        The calories your body needs at complete rest to maintain vital functions
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="bg-gradient-to-r from-[#ABD483]/5 to-[#8BAA7C]/5 rounded-lg p-4 border border-[#ABD483]/10"
                >
                    <div className="flex items-center mb-2">
                        <Activity className="w-5 h-5 mr-2 text-[#8BAA7C]" />
                        <h3 className="text-md font-medium text-[#010100]">Total Daily Energy Expenditure</h3>
                    </div>
                    <p className="text-2xl font-bold text-[#010100] ml-7">{tdee.toLocaleString()} <span className="text-sm font-normal text-gray-500">calories/day</span></p>
                    <p className="text-xs text-gray-600 ml-7 mt-1">
                        BMR adjusted for your activity level
                    </p>
                    <div className="ml-7 mt-2 bg-white p-2 rounded-md border border-[#ABD483]/10">
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-700">
                                <span className="font-medium">Activity Level:</span> {formatActivityLevel(activityLevel)}
                            </p>
                            <span className="text-xs bg-[#8BAA7C]/10 text-[#8BAA7C] font-medium px-2 py-0.5 rounded-full">
                                x{activityMultiplier.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="bg-gradient-to-r from-[#ABD483]/5 to-[#8BAA7C]/5 rounded-lg p-4 border border-[#ABD483]/10"
                >
                    <div className="flex items-center mb-2">
                        <Dumbbell className="w-5 h-5 mr-2 text-[#FC842D]" />
                        <h3 className="text-md font-medium text-[#010100]">Goal-Adjusted Calories</h3>
                    </div>
                    <p className="text-2xl font-bold text-[#010100] ml-7">{(tdee + goalAdjustment).toLocaleString()} <span className="text-sm font-normal text-gray-500">calories/day</span></p>
                    <p className="text-xs text-gray-600 ml-7 mt-1">
                        Your recommended daily intake for {goalType.replace('_', ' ')}
                    </p>
                    {goalAdjustment !== 0 && (
                        <div className="ml-7 mt-2 bg-white p-2 rounded-md border border-[#ABD483]/10">
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-700">
                                    <span className="font-medium">Goal Adjustment:</span> {goalText}
                                </p>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getGoalColor()} bg-opacity-10 bg-current`}>
                                    {goalAdjustment > 0 ? '+' : ''}{goalAdjustment} kcal
                                </span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-start text-xs text-gray-500">
                <Info className="h-4 w-4 text-[#8BAA7C] mr-1.5 flex-shrink-0 mt-0.5" />
                <p>These calculations are estimates based on your profile data. Actual calorie needs may vary by individual metabolism and activity.</p>
            </div>
        </motion.div>
    );
};

export default BMRCard;