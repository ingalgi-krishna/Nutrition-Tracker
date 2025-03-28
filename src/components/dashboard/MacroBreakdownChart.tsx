// src/components/dashboard/MacroBreakdownChart.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MacroBreakdownChartProps {
    proteins: number;
    carbs: number;
    fats: number;
}

const MacroBreakdownChart: React.FC<MacroBreakdownChartProps> = ({
    proteins,
    carbs,
    fats
}) => {
    // Create data for the pie chart
    const data = [
        { name: 'Protein', value: Math.round(proteins), color: '#ef4444' },
        { name: 'Carbs', value: Math.round(carbs), color: '#22c55e' },
        { name: 'Fats', value: Math.round(fats), color: '#eab308' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Macro Breakdown</h2>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${typeof value === 'number' ? value.toFixed(0) : value}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => {
                                return [typeof value === 'number' ? `${value.toFixed(1)}%` : value, 'Percentage'];
                            }}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.375rem'
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div>
                    <div className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                    <span className="text-sm font-medium text-gray-600">Protein</span>
                    <p className="text-lg font-semibold text-gray-800">{proteins.toFixed(1)}%</p>
                </div>
                <div>
                    <div className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-sm font-medium text-gray-600">Carbs</span>
                    <p className="text-lg font-semibold text-gray-800">{carbs.toFixed(1)}%</p>
                </div>
                <div>
                    <div className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                    <span className="text-sm font-medium text-gray-600">Fats</span>
                    <p className="text-lg font-semibold text-gray-800">{fats.toFixed(1)}%</p>
                </div>
            </div>
        </div>
    );
};

export default MacroBreakdownChart;