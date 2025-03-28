// src/app/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, subWeeks, subMonths } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyTotal {
    date: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    entryCount: number;
}

interface WeeklyAverage {
    week: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    entryCount: number;
}

interface GoalProgress {
    targetCalories: number;
    currentCalories: number;
    calorieDeviation: number;
    onTrack: boolean;
}

interface CommonFood {
    foodName: string;
    count: number;
}

interface AnalyticsData {
    dateRange: {
        start: string;
        end: string;
        rangeType: string;
    };
    dailyTotals: DailyTotal[];
    weeklyAverages: WeeklyAverage[] | null;
    overallStats: {
        totalEntries: number;
        averageCalories: number;
        averageProteins: number;
        averageCarbs: number;
        averageFats: number;
    };
    goalProgress: GoalProgress | null;
    mostCommonFoods: CommonFood[];
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
    const [customRange, setCustomRange] = useState(false);
    const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

    // Fetch analytics data
    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            let url = `/api/analytics?range=${dateRange}`;

            if (customRange) {
                url = `/api/analytics?startDate=${startDate}&endDate=${endDate}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch analytics');
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    // Update date range and fetch data
    const handleRangeChange = (range: 'day' | 'week' | 'month' | 'year') => {
        setDateRange(range);
        setCustomRange(false);
    };

    // Handle custom date range
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    // Apply custom range
    const applyCustomRange = () => {
        setCustomRange(true);
        fetchAnalytics();
    };

    // Fetch data when range changes
    useEffect(() => {
        if (!customRange) {
            fetchAnalytics();
        }
    }, [dateRange, customRange]);

    // Format date for display
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM d');
    };

    // Format week for display
    const formatWeek = (weekString: string) => {
        const [year, week] = weekString.split('-W');
        return `Week ${week}, ${year}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <svg
                        className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <p className="text-gray-600">Loading your analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-lg font-medium text-red-800 mb-2">Error</h2>
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={() => fetchAnalytics()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h2 className="text-lg font-medium text-yellow-800 mb-2">No Data Available</h2>
                    <p className="text-yellow-700">Start tracking your meals to see detailed analytics.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Nutrition Analytics
            </h1>

            {/* Date Range Selector */}
            <div className="bg-white p-4 rounded-lg shadow mb-8">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleRangeChange('day')}
                            className={`px-4 py-2 rounded-md ${dateRange === 'day' && !customRange
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => handleRangeChange('week')}
                            className={`px-4 py-2 rounded-md ${dateRange === 'week' && !customRange
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => handleRangeChange('month')}
                            className={`px-4 py-2 rounded-md ${dateRange === 'month' && !customRange
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => handleRangeChange('year')}
                            className={`px-4 py-2 rounded-md ${dateRange === 'year' && !customRange
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                        >
                            Year
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 ml-auto">
                        <label htmlFor="startDate" className="text-sm text-gray-600">From:</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={handleStartDateChange}
                            className="border rounded-md p-2 text-sm"
                        />

                        <label htmlFor="endDate" className="text-sm text-gray-600">To:</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={handleEndDateChange}
                            className="border rounded-md p-2 text-sm"
                        />

                        <button
                            onClick={applyCustomRange}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            {/* Overall Stats */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Overall Statistics</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-indigo-500 text-sm">Daily Average</p>
                        <p className="text-2xl font-bold">{data.overallStats.averageCalories}</p>
                        <p className="text-gray-600">calories</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-500 text-sm">Protein</p>
                        <p className="text-2xl font-bold">{data.overallStats.averageProteins}g</p>
                        <p className="text-gray-600">daily average</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-green-500 text-sm">Carbs</p>
                        <p className="text-2xl font-bold">{data.overallStats.averageCarbs}g</p>
                        <p className="text-gray-600">daily average</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-yellow-500 text-sm">Fats</p>
                        <p className="text-2xl font-bold">{data.overallStats.averageFats}g</p>
                        <p className="text-gray-600">daily average</p>
                    </div>
                </div>
            </div>

            {/* Goal Progress */}
            {data.goalProgress && (
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4">Goal Progress</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Target Calories</p>
                            <p className="text-2xl font-bold">{data.goalProgress.targetCalories}</p>
                            <p className="text-gray-600">per day</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Current Intake</p>
                            <p className="text-2xl font-bold">{data.goalProgress.currentCalories}</p>
                            <p className="text-gray-600">daily average</p>
                        </div>

                        <div className={`p-4 rounded-lg ${data.goalProgress.onTrack ? 'bg-green-50' : 'bg-yellow-50'
                            }`}>
                            <p className={`text-sm ${data.goalProgress.onTrack ? 'text-green-500' : 'text-yellow-500'
                                }`}>
                                Status
                            </p>
                            <p className="text-xl font-bold">
                                {data.goalProgress.calorieDeviation > 0 ? '+' : ''}
                                {data.goalProgress.calorieDeviation} calories
                            </p>
                            <p className={`${data.goalProgress.onTrack ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                {data.goalProgress.onTrack
                                    ? 'On track to meet goal'
                                    : data.goalProgress.calorieDeviation > 0
                                        ? 'Above target calories'
                                        : 'Below target calories'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Daily Calorie Chart */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Calorie Intake</h2>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data.dailyTotals}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                            />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number) => [`${value} calories`, 'Calories']}
                                labelFormatter={(label) => formatDate(label)}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="calories"
                                stroke="#4F46E5"
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                            />
                            {data.goalProgress && (
                                <Line
                                    type="monotone"
                                    dataKey={() => data.goalProgress?.targetCalories || 0}
                                    stroke="#DC2626"
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    name="Target"
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Macronutrient Distribution */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Macronutrient Distribution</h2>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data.dailyTotals}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                            />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number, name: string) => {
                                    const formattedName = name === 'proteins' ? 'Protein' :
                                        name === 'carbs' ? 'Carbs' : 'Fats';
                                    return [`${value}g`, formattedName];
                                }}
                                labelFormatter={(label) => formatDate(label)}
                            />
                            <Legend />
                            <Bar dataKey="proteins" fill="#4F46E5" name="Protein" />
                            <Bar dataKey="carbs" fill="#10B981" name="Carbs" />
                            <Bar dataKey="fats" fill="#F59E0B" name="Fats" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Weekly Averages */}
            {data.weeklyAverages && data.weeklyAverages.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4">Weekly Averages</h2>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data.weeklyAverages}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="week"
                                    tickFormatter={formatWeek}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string) => {
                                        const formattedName = name === 'calories' ? 'Calories' :
                                            name === 'proteins' ? 'Protein' :
                                                name === 'carbs' ? 'Carbs' : 'Fats';
                                        const unit = name === 'calories' ? '' : 'g';
                                        return [`${value}${unit}`, formattedName];
                                    }}
                                    labelFormatter={(label) => formatWeek(label)}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="calories"
                                    stroke="#4F46E5"
                                    name="Calories"
                                    yAxisId={0}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="proteins"
                                    stroke="#10B981"
                                    name="Protein (g)"
                                    yAxisId={1}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Most Common Foods */}
            {data.mostCommonFoods && data.mostCommonFoods.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Most Common Foods</h2>

                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Food
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Count
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.mostCommonFoods.map((food, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{food.foodName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{food.count} times</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}