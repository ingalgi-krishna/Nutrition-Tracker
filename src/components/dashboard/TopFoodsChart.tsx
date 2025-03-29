// src/components/dashboard/TopFoodsChart.tsx
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { motion } from 'framer-motion';
import { Award, Coffee, Info } from 'lucide-react';

interface TopFood {
    name: string;
    count: number;
}

interface TopFoodsChartProps {
    foods: TopFood[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 shadow-md rounded-lg border border-[#ABD483]/20">
                <p className="font-bold text-sm">{payload[0].payload.fullName}</p>
                <div className="flex items-center mt-1">
                    <Award className="h-4 w-4 text-[#8BAA7C] mr-1.5" />
                    <p className="text-sm font-medium text-[#010100]">
                        Logged {payload[0].value} times
                    </p>
                </div>
            </div>
        );
    }

    return null;
};

const TopFoodsChart: React.FC<TopFoodsChartProps> = ({ foods }) => {
    // Format data for the chart
    const data = foods
        .slice(0, 8) // Limit to top 8 foods
        .map(food => ({
            name: food.name.length > 15 ? food.name.substring(0, 15) + '...' : food.name,
            count: food.count,
            fullName: food.name
        }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-[#ABD483]/20 font-['DM_Sans']"
        >
            <div className="flex items-center mb-5">
                <div className="w-10 h-10 rounded-full bg-[#ABD483]/10 flex items-center justify-center mr-3">
                    <Award className="h-5 w-5 text-[#8BAA7C]" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-[#010100]">Most Logged Foods</h2>
                    <p className="text-xs text-gray-500">Your frequently tracked items</p>
                </div>
            </div>

            {foods.length > 0 ? (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis
                                type="number"
                                stroke="#9ca3af"
                                tick={{ fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                stroke="#9ca3af"
                                tick={{ fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="count"
                                name="Times Logged"
                                fill="#8BAA7C"
                                radius={[0, 4, 4, 0]}
                                barSize={16}
                            >
                                <LabelList dataKey="count" position="right" fill="#8BAA7C" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                    <Coffee className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No food entries logged yet</p>
                    <p className="text-gray-400 text-xs mt-1">Start logging your meals to see your most frequent foods</p>
                </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-start text-xs text-gray-500">
                <Info className="h-4 w-4 text-[#8BAA7C] mr-1.5 flex-shrink-0 mt-0.5" />
                <p>Foods you log frequently can help identify dietary patterns and preferences.</p>
            </div>
        </motion.div>
    );
};

export default TopFoodsChart;