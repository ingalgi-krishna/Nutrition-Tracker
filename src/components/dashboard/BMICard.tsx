// src/components/dashboard/BMICard.tsx
import React from 'react';

interface BMICardProps {
    bmi: number;
    height: number;
    weight: number;
    goalType: 'weight_loss' | 'weight_gain' | 'maintain';
}

const BMICard: React.FC<BMICardProps> = ({ bmi, height, weight, goalType }) => {
    // Function to determine BMI category
    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };

    // Function to determine color based on BMI
    const getBMIColor = (bmi: number) => {
        if (bmi < 18.5) return 'text-blue-500';
        if (bmi < 25) return 'text-green-500';
        if (bmi < 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    const bmiCategory = getBMICategory(bmi);
    const bmiColor = getBMIColor(bmi);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Your BMI</h2>

            <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                    <span className={`text-4xl font-bold ${bmiColor}`}>{bmi.toFixed(1)}</span>
                    <p className={`text-lg font-medium ${bmiColor}`}>{bmiCategory}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-100 p-3 rounded">
                    <p className="text-gray-500 text-sm">Height</p>
                    <p className="font-semibold">{height} cm</p>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                    <p className="text-gray-500 text-sm">Weight</p>
                    <p className="font-semibold">{weight} kg</p>
                </div>
            </div>

            <div className="mt-4">
                <p className="text-gray-700">
                    <span className="font-medium">Goal: </span>
                    {goalType === 'weight_loss' && 'Weight Loss'}
                    {goalType === 'weight_gain' && 'Weight Gain'}
                    {goalType === 'maintain' && 'Maintain Weight'}
                </p>
            </div>
        </div>
    );
};

export default BMICard;