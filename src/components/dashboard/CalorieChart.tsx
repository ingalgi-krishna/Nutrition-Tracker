// src/components/dashboard/CalorieChart.tsx
'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface CalorieChartProps {
    data: Array<{
        date: string;
        calories: number;
    }>;
    recommended?: number;
}

const CalorieChart: React.FC<CalorieChartProps> = ({ data, recommended }) => {
    // Format dates for display
    const formattedData = data.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Calorie Intake History</h2>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={formattedData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.375rem'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="calories"
                            stroke="#4f46e5"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                            name="Calories"
                        />
                        {recommended && (
                            <Line
                                type="monotone"
                                dataKey={() => recommended}
                                stroke="#16a34a"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Recommended"
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CalorieChart;