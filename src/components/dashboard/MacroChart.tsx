// src/components/dashboard/MacroChart.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MacroChartProps {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
}

const MacroChart: React.FC<MacroChartProps> = ({ calories, proteins, carbs, fats }) => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        // Calculate macro percentages
        const proteinCalories = proteins * 4;
        const carbCalories = carbs * 4;
        const fatCalories = fats * 9;

        const proteinPercentage = Math.round((proteinCalories / calories) * 100);
        const carbPercentage = Math.round((carbCalories / calories) * 100);
        const fatPercentage = Math.round((fatCalories / calories) * 100);

        setData([
            { name: 'Protein', value: proteinPercentage, color: '#4F46E5' }, // Indigo
            { name: 'Carbs', value: carbPercentage, color: '#10B981' },      // Green
            { name: 'Fat', value: fatPercentage, color: '#F59E0B' },         // Amber
        ]);
    }, [proteins, carbs, fats, calories]);

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Macronutrient Distribution</h2>

            <div className="mb-4">
                <div className="text-center mb-2">
                    <span className="text-2xl font-semibold">{calories}</span>
                    <span className="text-gray-500 ml-1">calories</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <span className="text-lg font-medium text-indigo-600">{proteins}g</span>
                        <p className="text-gray-500 text-sm">Protein</p>
                    </div>
                    <div>
                        <span className="text-lg font-medium text-green-600">{carbs}g</span>
                        <p className="text-gray-500 text-sm">Carbs</p>
                    </div>
                    <div>
                        <span className="text-lg font-medium text-amber-600">{fats}g</span>
                        <p className="text-gray-500 text-sm">Fat</p>
                    </div>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MacroChart;