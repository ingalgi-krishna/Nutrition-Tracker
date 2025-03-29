// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/Providers/AuthProvider';
import { Calendar, Activity, TrendingUp, Pizza } from 'lucide-react';
import MacroChart from '@/components/dashboard/MacroChart';
import BMICard from '@/components/dashboard/BMICard';
import CalorieChart from '@/components/dashboard/CalorieChart';
import MacroBreakdownChart from '@/components/dashboard/MacroBreakdownChart';
import TopFoodsChart from '@/components/dashboard/TopFoodsChart';
import StatsCard from '@/components/dashboard/StatsCard';
import FoodCard from '@/components/dashboard/FoodCard';
import BMRCard from '@/components/dashboard/BMRCard';
// Update the AnalyticsData interface in your dashboard component
interface AnalyticsData {
    user: {
        id: string;
        name: string;
        bmi: number | null;
        height: number | null;
        weight: number | null;
        goalType: string;
        activityLevel?: string; // Add this property
    };
    dailyTotals: Array<{
        date: string;
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
        count: number;
    }>;
    overall: {
        totalEntries: number;
        totalDays: number;
        averageCaloriesPerDay: number;
        averageProteinsPerDay: number;
        averageCarbsPerDay: number;
        averageFatsPerDay: number;
        totalCalories: number;
        totalProteins: number;
        totalCarbs: number;
        totalFats: number;
    };
    todayMacros: {
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
    };
    macroBreakdown: {
        proteins: number;
        carbs: number;
        fats: number;
    };
    topFoods: Array<{
        name: string;
        count: number;
    }>;
    recommendedMacros: {
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
        bmr: number; // Add these new properties
        tdee: number;
        activityMultiplier: number;
        goalAdjustment: number;
    };
}

export default function Dashboard() {
    const { user } = useAuth();
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    // Fetch analytics data
    useEffect(() => {
        if (!user?.id) return;

        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch analytics: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setAnalyticsData(data.data);
                } else {
                    setError(data.error || 'Failed to load analytics data');
                }
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Error loading dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user?.id, dateRange]);

    // Handle date range changes
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>
                    <p className="mt-2 text-gray-600">Please wait while we load your dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container p-6 mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
                    Welcome to Your Dashboard, {user.name}!
                </h1>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                            From
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            max={dateRange.endDate}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                            To
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            min={dateRange.startDate}
                            max={new Date().toISOString().split('T')[0]}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {loading && !analyticsData ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            ) : analyticsData ? (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title="Total Entries"
                            value={analyticsData.overall.totalEntries}
                            subtitle="Food items logged"
                            icon={<Calendar className="h-6 w-6" />}
                        />
                        <StatsCard
                            title="Daily Average"
                            value={`${Math.round(analyticsData.overall.averageCaloriesPerDay)} cal`}
                            subtitle="Average calories per day"
                            icon={<Activity className="h-6 w-6" />}
                            trend={
                                analyticsData.overall.totalDays > 1
                                    ? {
                                        value: 5,
                                        label: "vs previous period",
                                        direction: "up"
                                    }
                                    : undefined
                            }
                        />
                        <StatsCard
                            title="Average Protein"
                            value={`${Math.round(analyticsData.overall.averageProteinsPerDay)}g`}
                            subtitle="Daily protein intake"
                            icon={<TrendingUp className="h-6 w-6" />}
                        />
                        <StatsCard
                            title="Most Logged"
                            value={analyticsData.topFoods[0]?.name || "No data"}
                            subtitle={analyticsData.topFoods[0] ? `${analyticsData.topFoods[0].count} times` : ""}
                            icon={<Pizza className="h-6 w-6" />}
                        />
                    </div>

                    {/* Today's Macros and BMI */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MacroChart
                            calories={analyticsData.todayMacros.calories}
                            proteins={analyticsData.todayMacros.proteins}
                            carbs={analyticsData.todayMacros.carbs}
                            fats={analyticsData.todayMacros.fats}
                            goals={analyticsData.recommendedMacros}
                        />
                        <BMICard
                            bmi={analyticsData.user.bmi}
                            height={analyticsData.user.height}
                            weight={analyticsData.user.weight}
                        />
                    </div>

                    {/* Calorie Chart and Macro Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CalorieChart
                            data={analyticsData.dailyTotals}
                            recommended={analyticsData.recommendedMacros.calories}
                        />
                        <MacroBreakdownChart
                            proteins={analyticsData.macroBreakdown.proteins}
                            carbs={analyticsData.macroBreakdown.carbs}
                            fats={analyticsData.macroBreakdown.fats}
                        />
                    </div>

                    {/* Top Foods Chart */}
                    <div className="grid grid-cols-1 gap-6">
                        <TopFoodsChart foods={analyticsData.topFoods} />
                    </div>

                    {/* Nutrition Tips - Using Gemini API */}
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Personalized Nutrition Insights</h2>
                        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                            <p className="text-indigo-700">
                                Based on your data, consider balancing your macronutrients better.
                                {analyticsData.macroBreakdown.proteins < 20 && " Your protein intake is lower than recommended for your goals."}
                                {analyticsData.macroBreakdown.carbs > 60 && " Your carbohydrate intake is higher than optimal."}
                                {analyticsData.macroBreakdown.fats < 15 && " You may benefit from increasing healthy fat consumption."}
                                {" Remember that consistency is key to achieving your fitness goals."}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">No Data Available</h2>
                    <p className="text-gray-600 mb-6">Start logging your meals to see nutritional insights and analytics.</p>
                    <a
                        href="/food-log"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Go to Food Log
                    </a>
                </div>
            )}

            {analyticsData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Existing cards */}

                    {/* New BMR Card */}
                    <BMRCard
                        bmr={analyticsData.recommendedMacros.bmr}
                        tdee={analyticsData.recommendedMacros.tdee}
                        activityMultiplier={analyticsData.recommendedMacros.activityMultiplier}
                        activityLevel={analyticsData.user.activityLevel || 'moderate'}
                        goalType={analyticsData.user.goalType || 'maintain'}
                    />
                </div>
            )}

        </div>
    );
}