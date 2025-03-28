// src/components/dashboard/TopFoodsChart.tsx
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TopFood {
    name: string;
    count: number;
}

interface TopFoodsChartProps {
    foods: TopFood[];
}

const TopFoodsChart: React.FC<TopFoodsChartProps> = ({ foods }) => {
    // Format data for the chart
    const data = foods.map(food => ({
        name: food.name.length > 20 ? food.name.substring(0, 20) + '...' : food.name,
        count: food.count,
        fullName: food.name
    }));

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Most Logged Foods</h2>

            {foods.length > 0 ? (
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis type="number" stroke="#6b7280" />
                            <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
                            <Tooltip
                                formatter={(value) => [value, 'Times Logged']}
                                labelFormatter={(label) => {
                                    const item = data.find(item => item.name === label);
                                    return item ? item.fullName : label;
                                }}
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.375rem'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="count" name="Times Logged" fill="#4f46e5" barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex items-center justify-center h-72 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No food entries available</p>
                </div>
            )}
        </div>
    );
};

export default TopFoodsChart;