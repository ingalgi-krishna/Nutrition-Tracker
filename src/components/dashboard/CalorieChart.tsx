// src/components/dashboard/CalorieChart.tsx
'use client';

import React from 'react';
import { Flame, Zap, Calendar } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Area,
    AreaChart,
    ComposedChart
} from 'recharts';
import { motion } from 'framer-motion';

interface CalorieChartProps {
    data: Array<{
        date: string;
        calories: number;
    }>;
    recommended?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const calories = payload[0].value;
        const recommended = payload[1]?.value;
        const diff = calories - (recommended || 0);

        return (
            <div className="bg-white p-3 shadow-md rounded-lg border border-[#ABD483]/20">
                <p className="font-bold text-sm">{label}</p>
                <div className="flex items-center mt-1">
                    <Flame className="h-4 w-4 text-[#FC842D] mr-1.5" />
                    <p className="text-sm font-medium text-[#010100]">
                        {calories.toLocaleString()} kcal
                    </p>
                </div>

                {recommended && (
                    <>
                        <div className="flex items-center mt-1 text-gray-600">
                            <Zap className="h-4 w-4 text-[#8BAA7C] mr-1.5" />
                            <p className="text-sm">
                                Target: {recommended.toLocaleString()} kcal
                            </p>
                        </div>
                        <div className={`text-xs mt-1 font-medium ${diff > 0 ? 'text-[#FC842D]' : 'text-[#8BAA7C]'}`}>
                            {diff > 0 ? '+' : ''}{diff.toLocaleString()} kcal {diff > 0 ? 'over' : 'under'}
                        </div>
                    </>
                )}
            </div>
        );
    }

    return null;
};

const CalorieChart: React.FC<CalorieChartProps> = ({ data, recommended }) => {
    // Format dates for display
    const formattedData = data.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    }));

    // Calculate the moving average for the last 7 days
    const calculateMovingAverage = (data: any[], window: number = 7) => {
        return data.map((item, index) => {
            const start = Math.max(0, index - window + 1);
            const values = data.slice(start, index + 1).map(d => d.calories);
            const sum = values.reduce((acc, val) => acc + val, 0);
            return {
                ...item,
                movingAvg: values.length > 0 ? sum / values.length : 0
            };
        });
    };

    const dataWithMovingAvg = calculateMovingAverage(formattedData);

    // Find max value to set appropriate yAxis domain
    const maxCalories = Math.max(...data.map(item => item.calories), recommended || 0);
    const yAxisMax = Math.ceil(maxCalories * 1.1 / 500) * 500; // Round up to nearest 500

    // Find recent trend
    const getCalorieTrend = () => {
        if (data.length < 3) return { text: "Not enough data", color: "text-gray-500" };

        const recent = data.slice(-3).map(d => d.calories);
        const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;

        if (recommended) {
            if (avg > recommended * 1.1) return { text: "Trending higher than your target", color: "text-[#FC842D]" };
            if (avg < recommended * 0.9) return { text: "Trending lower than your target", color: "text-blue-500" };
            return { text: "On track with your calorie target", color: "text-[#8BAA7C]" };
        }

        return { text: "Monitoring your calorie intake", color: "text-gray-600" };
    };

    const trend = getCalorieTrend();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-[#ABD483]/20 font-DM_Sans"
        >
            <div className="flex items-center mb-5">
                <div className="w-10 h-10 rounded-full bg-[#ABD483]/10 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-[#8BAA7C]" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-[#010100]">Calorie Intake History</h2>
                    <p className={`text-xs ${trend.color}`}>{trend.text}</p>
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={dataWithMovingAvg}
                        margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                    >
                        <defs>
                            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FC842D" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#FC842D" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#9ca3af"
                            tick={{ fontSize: 12 }}
                            tickMargin={10}
                            axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            tick={{ fontSize: 12 }}
                            tickMargin={10}
                            domain={[0, yAxisMax]}
                            axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ paddingBottom: '10px' }}
                        />

                        {recommended && (
                            <ReferenceLine
                                y={recommended}
                                stroke="#8BAA7C"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{
                                    value: 'Target',
                                    position: 'insideTopRight',
                                    fill: '#8BAA7C',
                                    fontSize: 12
                                }}
                            />
                        )}

                        <Area
                            type="monotone"
                            dataKey="calories"
                            stroke="#FC842D"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCalories)"
                            activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                            name="Daily Calories"
                        />

                        <Line
                            type="monotone"
                            dataKey="movingAvg"
                            stroke="#8BAA7C"
                            strokeWidth={2}
                            dot={false}
                            name="7-Day Average"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center mt-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#FC842D] mr-1.5"></div>
                    <span>Daily Intake</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8BAA7C] mr-1.5"></div>
                    <span>7-Day Average</span>
                </div>
                {recommended && (
                    <div className="flex items-center">
                        <div className="w-3 h-0.5 bg-[#8BAA7C] mr-1.5 border-t border-b border-dashed border-[#8BAA7C]"></div>
                        <span>Target ({recommended.toLocaleString()} kcal)</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default CalorieChart;