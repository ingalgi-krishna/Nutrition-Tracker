// src/components/dashboard/MacroBreakdownChart.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { PieChart as PieChartIcon, Beef, Wheat, Droplet } from 'lucide-react';

interface MacroBreakdownChartProps {
    proteins: number;
    carbs: number;
    fats: number;
}

const RECOMMENDED_RANGES = {
    protein: { min: 15, max: 35 },
    carbs: { min: 45, max: 65 },
    fat: { min: 20, max: 35 }
};

const MacroBreakdownChart: React.FC<MacroBreakdownChartProps> = ({
    proteins,
    carbs,
    fats
}) => {
    // Create data for the pie chart
    const data = [
        { name: 'Protein', value: Math.round(proteins), color: '#8BAA7C' },
        { name: 'Carbs', value: Math.round(carbs), color: '#ABD483' },
        { name: 'Fat', value: Math.round(fats), color: '#FC842D' },
    ];

    // Check if macros are within recommended ranges
    const isMacroInRange = (type: 'protein' | 'carbs' | 'fat', value: number) => {
        const range = RECOMMENDED_RANGES[type];
        if (value < range.min) return "too low";
        if (value > range.max) return "too high";
        return "optimal";
    };

    const proteinStatus = isMacroInRange('protein', proteins);
    const carbsStatus = isMacroInRange('carbs', carbs);
    const fatStatus = isMacroInRange('fat', fats);

    // Custom tooltip for the pie chart
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 shadow-md rounded-lg border border-[#ABD483]/20">
                    <p className="font-bold text-sm">{data.name}</p>
                    <p className="text-sm font-medium" style={{ color: data.payload.color }}>
                        {data.value}% of total calories
                    </p>
                </div>
            );
        }
        return null;
    };

    const getMacroStatusColor = (status: string) => {
        if (status === "too low") return "text-blue-500";
        if (status === "too high") return "text-[#FC842D]";
        return "text-[#8BAA7C]";
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
                    <PieChartIcon className="h-5 w-5 text-[#8BAA7C]" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-[#010100]">Macro Balance</h2>
                    <p className="text-xs text-gray-500">Protein, carbohydrate, and fat distribution</p>
                </div>
            </div>

            <div className="h-48 md:h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="#FFFFFF"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="circle"
                            iconSize={8}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="bg-[#8BAA7C]/10 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                        <Beef className="h-4 w-4 text-[#8BAA7C] mr-1.5" />
                        <span className="text-sm font-medium text-[#010100]">Protein</span>
                    </div>
                    <p className="text-lg font-bold text-[#8BAA7C]">{proteins.toFixed(1)}%</p>
                    <p className={`text-xs ${getMacroStatusColor(proteinStatus)}`}>
                        {proteinStatus === "optimal" ? "Optimal range" :
                            proteinStatus === "too low" ? "Below target" : "Above target"}
                    </p>
                </div>
                <div className="bg-[#ABD483]/10 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                        <Wheat className="h-4 w-4 text-[#ABD483] mr-1.5" />
                        <span className="text-sm font-medium text-[#010100]">Carbs</span>
                    </div>
                    <p className="text-lg font-bold text-[#ABD483]">{carbs.toFixed(1)}%</p>
                    <p className={`text-xs ${getMacroStatusColor(carbsStatus)}`}>
                        {carbsStatus === "optimal" ? "Optimal range" :
                            carbsStatus === "too low" ? "Below target" : "Above target"}
                    </p>
                </div>
                <div className="bg-[#FC842D]/10 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                        <Droplet className="h-4 w-4 text-[#FC842D]/70 mr-1.5" />
                        <span className="text-sm font-medium text-[#010100]">Fats</span>
                    </div>
                    <p className="text-lg font-bold text-[#FC842D]">{fats.toFixed(1)}%</p>
                    <p className={`text-xs ${getMacroStatusColor(fatStatus)}`}>
                        {fatStatus === "optimal" ? "Optimal range" :
                            fatStatus === "too low" ? "Below target" : "Above target"}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default MacroBreakdownChart;