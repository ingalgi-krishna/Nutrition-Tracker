'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Ruler, Activity, AlertTriangle, Info } from 'lucide-react';

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
        if (bmi < 25) return 'text-[#8BAA7C]';
        if (bmi < 30) return 'text-[#FC842D]';
        return 'text-red-500';
    };

    const getBMIDescription = (bmi: number): string => {
        if (bmi < 18.5) return 'You may need to gain some weight for optimal health.';
        if (bmi < 25) return 'You have a healthy weight relative to your height.';
        if (bmi < 30) return 'You may benefit from losing some weight for optimal health.';
        return 'For your health, it is recommended to reduce your weight.';
    };

    // Calculate position of BMI indicator
    const getBMIPosition = (bmi: number): string => {
        // Clamp BMI between 15 and 35 for display purposes
        const clampedBmi = Math.max(15, Math.min(35, bmi));
        // Convert to percentage position (15 = 0%, 35 = 100%)
        const position = ((clampedBmi - 15) / 20) * 100;
        return `${position}%`;
    };

    // If BMI and measurements aren't available yet
    if (!bmi || !height || !weight) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-[#ABD483]/20 font-['DM_Sans']"
            >
                <div className="flex items-center mb-5">
                    <div className="w-10 h-10 rounded-full bg-[#ABD483]/10 flex items-center justify-center mr-3">
                        <Scale className="h-5 w-5 text-[#8BAA7C]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#010100]">Body Mass Index (BMI)</h2>
                </div>

                <div className="text-center py-8 px-4">
                    <AlertTriangle className="h-12 w-12 text-[#FC842D]/70 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                        Please update your height and weight in your profile to see your BMI assessment.
                    </p>
                    <button className="px-5 py-2.5 bg-[#FC842D] text-white rounded-lg hover:bg-[#FC842D]/90 transition-all font-bold shadow-md hover:shadow-lg">
                        Update Profile
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-[#ABD483]/20 font-['DM_Sans']"
        >
            <div className="flex items-center mb-5">
                <div className="w-10 h-10 rounded-full bg-[#ABD483]/10 flex items-center justify-center mr-3">
                    <Scale className="h-5 w-5 text-[#8BAA7C]" />
                </div>
                <h2 className="text-lg font-bold text-[#010100]">Body Mass Index (BMI)</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center mb-1">
                        <Ruler className="h-4 w-4 text-[#8BAA7C] mr-1.5" />
                        <p className="text-sm text-gray-600">Height</p>
                    </div>
                    <p className="text-lg font-bold">{height} <span className="text-sm font-normal text-gray-500">cm</span></p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center mb-1">
                        <Activity className="h-4 w-4 text-[#8BAA7C] mr-1.5" />
                        <p className="text-sm text-gray-600">Weight</p>
                    </div>
                    <p className="text-lg font-bold">{weight} <span className="text-sm font-normal text-gray-500">kg</span></p>
                </div>
            </div>

            <div className="text-center mb-6">
                <div className="mb-2">
                    <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className={`text-5xl font-bold ${getBMIColor(bmi)}`}
                    >
                        {bmi.toFixed(1)}
                    </motion.span>
                </div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className={`text-lg font-bold ${getBMIColor(bmi)}`}
                >
                    {getBMICategory(bmi)}
                </motion.p>
                <p className="text-sm text-gray-600 mt-1 max-w-xs mx-auto">
                    {getBMIDescription(bmi)}
                </p>
            </div>

            <div className="mt-4 relative">
                <div className="w-full h-3.5 bg-gradient-to-r from-blue-500 via-[#8BAA7C] to-red-500 rounded-full overflow-hidden"></div>

                {/* BMI marker */}
                <div
                    className="absolute top-0 w-0.5 h-3.5 bg-white"
                    style={{ left: getBMIPosition(bmi) }}
                ></div>

                <div className="flex justify-between text-xs mt-1.5">
                    <span className="text-blue-500 font-medium">18.5</span>
                    <span className="text-[#8BAA7C] font-medium">25</span>
                    <span className="text-[#FC842D] font-medium">30</span>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                    <span>Underweight</span>
                    <span>Normal</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-start text-xs text-gray-500">
                <Info className="h-4 w-4 text-[#8BAA7C] mr-1.5 flex-shrink-0 mt-0.5" />
                <p>BMI is a screening tool but doesn't diagnose body fatness or health. Consult with healthcare providers for a complete health assessment.</p>
            </div>
        </motion.div>
    );
};

export default BMICard;