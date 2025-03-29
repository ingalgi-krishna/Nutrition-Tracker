'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Flame, Beef, Wheat, Droplet } from 'lucide-react';

interface MacroChartProps {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    goals?: {
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
    };
}

const MacroChart: React.FC<MacroChartProps> = ({
    calories,
    proteins,
    carbs,
    fats,
    goals = {
        calories: 2000,  // Default goals if not provided
        proteins: 150,
        carbs: 200,
        fats: 65
    }
}) => {
    // Calculate percentage of goal
    const caloriePercent = Math.min(100, Math.round((calories / goals.calories) * 100));
    const proteinPercent = Math.min(100, Math.round((proteins / goals.proteins) * 100));
    const carbPercent = Math.min(100, Math.round((carbs / goals.carbs) * 100));
    const fatPercent = Math.min(100, Math.round((fats / goals.fats) * 100));

    // Visual indicators based on percentage
    const getProgressColor = (percent: number, type: 'calorie' | 'protein' | 'carb' | 'fat') => {
        if (percent > 100) return 'bg-red-500';
        if (percent > 90) return 'bg-amber-500';
        if (type === 'calorie') return 'bg-[#FC842D]';
        if (type === 'protein') return 'bg-[#8BAA7C]';
        if (type === 'carb') return 'bg-[#ABD483]';
        if (type === 'fat') return 'bg-[#8BAA7C]/70';
        return 'bg-gray-300';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-[#ABD483]/20 font-DM_Sans"
        >
            <div className="flex items-center mb-5">
                <div className="w-10 h-10 rounded-full bg-[#ABD483]/10 flex items-center justify-center mr-3">
                    <Utensils className="h-5 w-5 text-[#8BAA7C]" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-[#010100]">Today's Nutrition</h2>
                    <p className="text-xs text-gray-500">
                        {caloriePercent < 80
                            ? `${100 - caloriePercent}% remaining to reach your daily goal`
                            : caloriePercent > 100
                                ? `You've exceeded your daily goal by ${caloriePercent - 100}%`
                                : `You're right on track with your daily goals!`}
                    </p>
                </div>
            </div>

            <div className="space-y-5">
                <div>
                    <div className="flex justify-between mb-1.5 items-center">
                        <div className="flex items-center">
                            <Flame className="h-4 w-4 text-[#FC842D] mr-1.5" />
                            <span className="font-medium text-[#010100]">Calories</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[#010100] font-bold">{calories}</span>
                            <span className="text-gray-400 text-sm"> / {goals.calories} kcal</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${caloriePercent}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`${getProgressColor(caloriePercent, 'calorie')} h-2.5 rounded-full`}
                        ></motion.div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1.5 items-center">
                        <div className="flex items-center">
                            <Beef className="h-4 w-4 text-[#8BAA7C] mr-1.5" />
                            <span className="font-medium text-[#010100]">Protein</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[#010100] font-bold">{proteins}g</span>
                            <span className="text-gray-400 text-sm"> / {goals.proteins}g</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${proteinPercent}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className={`${getProgressColor(proteinPercent, 'protein')} h-2.5 rounded-full`}
                        ></motion.div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1.5 items-center">
                        <div className="flex items-center">
                            <Wheat className="h-4 w-4 text-[#ABD483] mr-1.5" />
                            <span className="font-medium text-[#010100]">Carbs</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[#010100] font-bold">{carbs}g</span>
                            <span className="text-gray-400 text-sm"> / {goals.carbs}g</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${carbPercent}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className={`${getProgressColor(carbPercent, 'carb')} h-2.5 rounded-full`}
                        ></motion.div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1.5 items-center">
                        <div className="flex items-center">
                            <Droplet className="h-4 w-4 text-[#8BAA7C]/70 mr-1.5" />
                            <span className="font-medium text-[#010100]">Fats</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[#010100] font-bold">{fats}g</span>
                            <span className="text-gray-400 text-sm"> / {goals.fats}g</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${fatPercent}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`${getProgressColor(fatPercent, 'fat')} h-2.5 rounded-full`}
                        ></motion.div>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Calories</div>
                        <div className={`text-sm font-bold ${caloriePercent > 100 ? 'text-red-500' : 'text-[#FC842D]'}`}>{caloriePercent}%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Protein</div>
                        <div className={`text-sm font-bold ${proteinPercent > 100 ? 'text-red-500' : 'text-[#8BAA7C]'}`}>{proteinPercent}%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Carbs</div>
                        <div className={`text-sm font-bold ${carbPercent > 100 ? 'text-red-500' : 'text-[#ABD483]'}`}>{carbPercent}%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Fats</div>
                        <div className={`text-sm font-bold ${fatPercent > 100 ? 'text-red-500' : 'text-[#8BAA7C]/70'}`}>{fatPercent}%</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MacroChart;