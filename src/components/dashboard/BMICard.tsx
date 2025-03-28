'use client';

import React from 'react';

interface BMICardProps {
    bmi: number | null;
    height: number | null;
    weight: number | null;
}

const BMICard: React.FC<BMICardProps> = ({ bmi, height, weight }) => {
    const getBMICategory = (bmi: number): string => {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };

    const getBMIColor = (bmi: number): string => {
        if (bmi < 18.5) return 'text-blue-500';
        if (bmi < 25) return 'text-green-500';
        if (bmi < 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    // If BMI and measurements aren't available yet
    if (!bmi || !height || !weight) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Body Mass Index (BMI)</h2>
                <div className="text-center py-6">
                    <p className="text-gray-500">
                        Please update your height and weight in your profile to see your BMI.
                    </p>
                    <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                        Update Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Body Mass Index (BMI)</h2>

            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-gray-600">Height</p>
                    <p className="text-lg font-medium">{height} cm</p>
                </div>
                <div>
                    <p className="text-gray-600">Weight</p>
                    <p className="text-lg font-medium">{weight} kg</p>
                </div>
            </div>

            <div className="text-center">
                <div className="mb-2">
                    <span className="text-3xl font-bold inline-block">
                        <span className={getBMIColor(bmi)}>{bmi.toFixed(1)}</span>
                    </span>
                </div>
                <p className={`text-lg font-medium ${getBMIColor(bmi)}`}>
                    {getBMICategory(bmi)}
                </p>
            </div>

            <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-blue-500 via-green-500 to-red-500 h-2.5 rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Underweight</span>
                    <span>Normal</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                </div>
            </div>
        </div>
    );
};

export default BMICard;