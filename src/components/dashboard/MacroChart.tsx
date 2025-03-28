'use client';

import React from 'react';

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

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Macros</h2>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Calories</span>
                        <span className="text-gray-700">{calories} / {goals.calories} kcal</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${caloriePercent}%` }}
                        ></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Protein</span>
                        <span className="text-gray-700">{proteins} / {goals.proteins}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-red-500 h-2.5 rounded-full"
                            style={{ width: `${proteinPercent}%` }}
                        ></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Carbs</span>
                        <span className="text-gray-700">{carbs} / {goals.carbs}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-green-500 h-2.5 rounded-full"
                            style={{ width: `${carbPercent}%` }}
                        ></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Fats</span>
                        <span className="text-gray-700">{fats} / {goals.fats}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-yellow-500 h-2.5 rounded-full"
                            style={{ width: `${fatPercent}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-2 w-full">
                    <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-red-500 mb-1"></div>
                        <span className="text-xs text-gray-600">Protein</span>
                        <span className="text-sm font-medium">{proteinPercent}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-green-500 mb-1"></div>
                        <span className="text-xs text-gray-600">Carbs</span>
                        <span className="text-sm font-medium">{carbPercent}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 mb-1"></div>
                        <span className="text-xs text-gray-600">Fats</span>
                        <span className="text-sm font-medium">{fatPercent}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MacroChart;