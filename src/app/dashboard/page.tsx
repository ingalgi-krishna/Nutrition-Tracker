// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/Providers/AuthProvider';
import {
    Calendar,
    Activity,
    TrendingUp,
    Pizza,
    User,
    RefreshCw,
    AlertTriangle,
    Scale,
    Heart,
    Leaf,
    Apple,
    BarChart3,
    Brain,

    Coffee,
    BarChart,
    AlertCircle,
    Lightbulb,
    LightbulbIcon,
    Check,
    Milk
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MacroChart from '@/components/dashboard/MacroChart';
import BMICard from '@/components/dashboard/BMICard';
import CalorieChart from '@/components/dashboard/CalorieChart';
import MacroBreakdownChart from '@/components/dashboard/MacroBreakdownChart';
import TopFoodsChart from '@/components/dashboard/TopFoodsChart';
import StatsCard from '@/components/dashboard/StatsCard';
import FoodCard from '@/components/dashboard/FoodCard';
import BMRCard from '@/components/dashboard/BMRCard';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5 }
    }
};

interface FoodEntry {
    _id: string;
    foodName: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    timestamp: string;
    imageUrl?: string;
    userId: string;
    mealTime?: string;
}

// Update the AnalyticsData interface in your dashboard component
interface AnalyticsData {
    user: {
        id: string;
        name: string;
        bmi: number | null;
        height: number | null;
        weight: number | null;
        goalType: string;
        activityLevel?: string;
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
        bmr: number;
        tdee: number;
        activityMultiplier: number;
        goalAdjustment: number;
    };
    recentFoods?: FoodEntry[];
}

export default function Dashboard() {
    const { user } = useAuth();
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });
    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour < 12) {
            return "Good morning";
        } else if (hour < 18) {
            return "Good afternoon";
        } else {
            return "Good evening";
        }
    };
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
                    // Fetch food entries for the current user
                    const foodEntriesResponse = await fetch(`/api/food-entries?userId=${user.id}&limit=4`);

                    if (foodEntriesResponse.ok) {
                        const foodEntriesData = await foodEntriesResponse.json();

                        if (foodEntriesData.success) {
                            data.data.recentFoods = foodEntriesData.data;
                        }
                    }

                    setAnalyticsData(data.data);
                } else {
                    setError(data.error || 'Failed to load analytics data');
                }
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Error loading dashboard data. Please try again later.');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        fetchAnalytics();
    }, [user?.id, dateRange]);

    // Handle date range changes
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        setDateRange({ ...dateRange });
    };

    // Handle food delete
    const handleFoodDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/food-entries/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Update local state to remove the deleted item
                if (analyticsData && analyticsData.recentFoods) {
                    setAnalyticsData({
                        ...analyticsData,
                        recentFoods: analyticsData.recentFoods.filter(food => food._id !== id)
                    });
                }
                // Show success toast or message here if you have a toast component
            } else {
                setError('Failed to delete food entry');
            }
        } catch (err) {
            console.error('Error deleting food entry:', err);
            setError('Error deleting food entry');
        }
    };

    // Helper to format numbers
    const formatNumber = (num: number) => {
        return num.toFixed(num % 1 === 0 ? 0 : 1);
    };

    // Helper to get goal icon
    const getGoalIcon = (goalType: string) => {
        if (goalType === 'weight_loss') return <Activity className="h-4 w-4 text-red-500" />;
        if (goalType === 'weight_gain') return <BarChart className="h-4 w-4 text-blue-500" />;
        return <Heart className="h-4 w-4 text-green-500" />;
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-DM_Sans">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[#010100] mb-4">Loading...</h1>
                    <p className="text-gray-600">Please wait while we check your authentication status.</p>
                </div>
            </div>
        );
    }

    if (loading && !refreshing) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-[#FEFEFF] font-DM_Sans">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-8 max-w-md"
                >
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-[#ABD483]/20 mx-auto mb-6 flex items-center justify-center">
                            <Activity className="animate-spin h-10 w-10 text-[#8BAA7C]" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FC842D] rounded-full flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#010100] mb-3">Analyzing Your Nutrition</h2>
                    <p className="text-gray-600 mb-6">
                        We're processing your nutrition data to provide insights into your health journey.
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5 }}
                            className="h-full bg-gradient-to-r from-[#ABD483] to-[#8BAA7C] rounded-full"
                        ></motion.div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-DM_Sans bg-[#FEFEFF]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#010100]">
                        {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Here's your nutrition insights and analytics for today
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1">
                                From
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={dateRange.startDate}
                                onChange={handleDateChange}
                                max={dateRange.endDate}
                                className="block w-full px-3 py-2 border border-[#ABD483]/20 rounded-lg text-sm focus:outline-none focus:ring-[#8BAA7C] focus:border-[#8BAA7C]"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 mb-1">
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
                                className="block w-full px-3 py-2 border border-[#ABD483]/20 rounded-lg text-sm focus:outline-none focus:ring-[#8BAA7C] focus:border-[#8BAA7C]"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-4 py-2.5 bg-[#8BAA7C] text-white rounded-lg hover:bg-[#8BAA7C]/90 focus:outline-none focus:ring-2 focus:ring-[#8BAA7C] focus:ring-offset-2 transition-all duration-200 flex items-center font-medium shadow-sm disabled:opacity-70 self-end"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-8 flex items-center space-x-3"
                >
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700">
                        {error}
                    </p>
                </motion.div>
            )}

            {analyticsData && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-[#8BAA7C]/10 to-[#ABD483]/10 rounded-xl p-6 mb-8 border border-[#ABD483]/20"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-[#010100] mb-2 flex items-center">
                                <User className="h-5 w-5 mr-2 text-[#8BAA7C]" />
                                Your Nutrition Profile
                            </h2>
                            <div className="flex flex-wrap gap-3 text-gray-700">
                                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-[#ABD483]/20">
                                    <Scale className="h-4 w-4 mr-1.5 text-[#8BAA7C]" />
                                    <span>BMI: <span className="font-semibold">{analyticsData.user.bmi ? analyticsData.user.bmi.toFixed(1) : 'N/A'}</span></span>
                                </div>

                                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-[#ABD483]/20">
                                    {getGoalIcon(analyticsData.user.goalType)}
                                    <span className="ml-1.5 font-semibold capitalize">
                                        {analyticsData.user.goalType === 'weight_loss' ? 'Weight Loss' :
                                            analyticsData.user.goalType === 'weight_gain' ? 'Weight Gain' : 'Weight Maintenance'}
                                    </span>
                                </div>

                                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-[#ABD483]/20">
                                    <Leaf className="h-4 w-4 mr-1.5 text-[#8BAA7C]" />
                                    <span className="font-semibold capitalize">
                                        {analyticsData.user.activityLevel || 'Moderate Activity'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg shadow-sm border border-[#ABD483]/10 flex gap-4">
                            <div className="text-center px-3 border-r border-gray-100">
                                <div className="text-sm text-gray-500">Calories</div>
                                <div className="font-bold text-[#FC842D]">{formatNumber(analyticsData.todayMacros.calories)}</div>
                            </div>
                            <div className="text-center px-3 border-r border-gray-100">
                                <div className="text-sm text-gray-500">Protein</div>
                                <div className="font-bold text-[#8BAA7C]">{formatNumber(analyticsData.todayMacros.proteins)}g</div>
                            </div>
                            <div className="text-center px-3 border-r border-gray-100">
                                <div className="text-sm text-gray-500">Carbs</div>
                                <div className="font-bold text-[#8BAA7C]">{formatNumber(analyticsData.todayMacros.carbs)}g</div>
                            </div>
                            <div className="text-center px-3">
                                <div className="text-sm text-gray-500">Fats</div>
                                <div className="font-bold text-[#8BAA7C]">{formatNumber(analyticsData.todayMacros.fats)}g</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {refreshing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#FEFEFF]/80 flex items-center justify-center z-50"
                    >
                        <div className="bg-white p-8 rounded-xl shadow-xl border border-[#ABD483]/20 flex flex-col items-center">
                            <Activity className="animate-spin h-10 w-10 text-[#8BAA7C] mb-4" />
                            <p className="text-[#010100] font-medium">Updating your analytics...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {analyticsData && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Stats Cards Row - 4 small cards spanning 3 columns each */}
                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-3 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <StatsCard
                                title="Total Entries"
                                value={analyticsData.overall.totalEntries}
                                subtitle="Food items logged"
                                icon={<Calendar className="h-6 w-6 text-[#8BAA7C]" />}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-3 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <StatsCard
                                title="Daily Average"
                                value={`${Math.round(analyticsData.overall.averageCaloriesPerDay)} cal`}
                                subtitle="Average calories per day"
                                icon={<Activity className="h-6 w-6 text-[#8BAA7C]" />}
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
                        </motion.div>

                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-3 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <StatsCard
                                title="Average Protein"
                                value={`${Math.round(analyticsData.overall.averageProteinsPerDay)}g`}
                                subtitle="Daily protein intake"
                                icon={<TrendingUp className="h-6 w-6 text-[#8BAA7C]" />}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-3 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <StatsCard
                                title="Most Logged"
                                value={analyticsData.topFoods[0]?.name || "No data"}
                                subtitle={analyticsData.topFoods[0] ? `${analyticsData.topFoods[0].count} times` : ""}
                                icon={<Pizza className="h-6 w-6 text-[#8BAA7C]" />}
                            />
                        </motion.div>

                        {/* MacroChart - Large card taking up 8 columns */}
                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <div className="p-5 border-b border-[#ABD483]/10">
                                <h3 className="text-lg font-bold text-[#010100] flex items-center">
                                    Today's Nutrition Progress
                                    <span className="ml-2 px-2 py-0.5 bg-[#FC842D]/10 text-[#FC842D] text-xs rounded-full font-medium">
                                        Featured
                                    </span>
                                </h3>
                            </div>
                            <div className="p-5">
                                <MacroChart
                                    calories={analyticsData.todayMacros.calories}
                                    proteins={analyticsData.todayMacros.proteins}
                                    carbs={analyticsData.todayMacros.carbs}
                                    fats={analyticsData.todayMacros.fats}
                                    goals={analyticsData.recommendedMacros}
                                />
                            </div>
                        </motion.div>

                        {/* BMI Card - Medium card taking up 4 columns */}
                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-4 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <div className="p-5 border-b border-[#ABD483]/10">
                                <h3 className="text-lg font-bold text-[#010100]">BMI Analysis</h3>
                            </div>
                            <div className="p-5">
                                <BMICard
                                    bmi={analyticsData.user.bmi}
                                    height={analyticsData.user.height}
                                    weight={analyticsData.user.weight}
                                />
                            </div>
                        </motion.div>

                        {/* Recent Foods Section - Using your FoodCard component */}
                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-6 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <div className="p-5 border-b border-[#ABD483]/10">
                                <h3 className="text-lg font-bold text-[#010100]">Recent Food Entries</h3>
                            </div>
                            <div className="p-5">
                                {analyticsData.recentFoods && analyticsData.recentFoods.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {analyticsData.recentFoods.slice(0, 4).map((food) => (
                                            <FoodCard
                                                key={food._id}
                                                foodName={food.foodName}
                                                calories={food.calories}
                                                proteins={food.proteins}
                                                carbs={food.carbs}
                                                fats={food.fats}
                                                timestamp={food.timestamp}
                                                imageUrl={food.imageUrl}
                                                onDelete={() => handleFoodDelete(food._id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Pizza className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No recent food entries</p>
                                    </div>
                                )}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                                    <a href="/food-log" className="text-[#8BAA7C] font-medium text-sm flex items-center hover:text-[#8BAA7C]/80 transition-colors">
                                        View All Food Entries
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        {/* MacroBreakdown - Medium card taking up 6 columns */}
                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-6 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <div className="p-5 border-b border-[#ABD483]/10">
                                <h3 className="text-lg font-bold text-[#010100]">Macro Distribution</h3>
                            </div>
                            <div className="p-5">
                                <MacroBreakdownChart
                                    proteins={analyticsData.macroBreakdown.proteins}
                                    carbs={analyticsData.macroBreakdown.carbs}
                                    fats={analyticsData.macroBreakdown.fats}
                                />
                            </div>
                        </motion.div>

                        {/* CalorieChart - Large card taking up 8 columns */}
                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <div className="p-5 border-b border-[#ABD483]/10">
                                <h3 className="text-lg font-bold text-[#010100]">Calorie Trends</h3>
                            </div>
                            <div className="p-5">
                                <CalorieChart
                                    data={analyticsData.dailyTotals}
                                    recommended={analyticsData.recommendedMacros.calories}
                                />
                            </div>
                        </motion.div>

                        {/* BMR Card - Medium card taking up 4 columns */}
                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-4 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <div className="p-5 border-b border-[#ABD483]/10">
                                <h3 className="text-lg font-bold text-[#010100]">Metabolic Rate</h3>
                            </div>
                            <div className="p-5">
                                <BMRCard
                                    bmr={analyticsData.recommendedMacros.bmr}
                                    tdee={analyticsData.recommendedMacros.tdee}
                                    activityMultiplier={analyticsData.recommendedMacros.activityMultiplier}
                                    activityLevel={analyticsData.user.activityLevel || 'moderate'}
                                    goalType={analyticsData.user.goalType || 'maintain'}
                                />
                            </div>
                        </motion.div>

                        {/* Top Foods - Medium card taking up 4 columns */}
                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-4 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <div className="p-5 border-b border-[#ABD483]/10">
                                <h3 className="text-lg font-bold text-[#010100]">Most Logged Foods</h3>
                            </div>
                            <div className="p-5">
                                <TopFoodsChart foods={analyticsData.topFoods} />
                            </div>
                        </motion.div>

                        {/* Nutrition Insights Card */}
                        {/* Nutrition Insights Card - Enhanced UI */}
                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300">
                            <div className="p-5 border-b border-[#ABD483]/10 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-[#010100] flex items-center">
                                    <span className="w-7 h-7 rounded-full bg-[#ABD483]/20 flex items-center justify-center mr-2">
                                        <Brain className="h-4 w-4 text-[#8BAA7C]" />
                                    </span>
                                    Personalized Nutrition Insights
                                </h3>
                                <span className="text-xs text-gray-500">AI-powered recommendations</span>
                            </div>
                            <div className="p-5">
                                <div className="space-y-4">
                                    {/* Macro Balance Insight Card */}
                                    <div className="bg-gradient-to-r from-[#ABD483]/5 to-[#ABD483]/15 rounded-xl overflow-hidden">
                                        <div className="flex items-center border-b border-[#ABD483]/10 p-4">
                                            <div className="w-10 h-10 rounded-full bg-[#ABD483]/20 flex items-center justify-center mr-3">
                                                <BarChart3 className="h-5 w-5 text-[#8BAA7C]" />
                                            </div>
                                            <h4 className="font-bold text-[#010100]">Macro Balance Analysis</h4>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-start mb-4">
                                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#010100] mb-1">Improvement Needed</p>
                                                    <p className="text-gray-700">
                                                        Your protein intake is lower than recommended for your goals. Aim for a balanced distribution to support your maintain goals.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Macro Progress Bars */}
                                            <div className="mt-5 space-y-3">
                                                <div>
                                                    <div className="flex justify-between items-center mb-1 text-sm">
                                                        <span className="font-medium text-[#010100]">Protein</span>
                                                        <span className="text-red-500 font-medium">Low</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                        <div className="bg-red-400 h-2.5 rounded-full" style={{ width: `${analyticsData.macroBreakdown.proteins}%` }}></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                        <span>Current: {analyticsData.macroBreakdown.proteins}%</span>
                                                        <span>Target: 25-30%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-1 text-sm">
                                                        <span className="font-medium text-[#010100]">Carbs</span>
                                                        <span className={analyticsData.macroBreakdown.carbs > 60 ? "text-orange-500 font-medium" : "text-green-500 font-medium"}>
                                                            {analyticsData.macroBreakdown.carbs > 60 ? "High" : "Optimal"}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                        <div
                                                            className={analyticsData.macroBreakdown.carbs > 60 ? "bg-orange-400 h-2.5 rounded-full" : "bg-green-400 h-2.5 rounded-full"}
                                                            style={{ width: `${analyticsData.macroBreakdown.carbs}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                        <span>Current: {analyticsData.macroBreakdown.carbs}%</span>
                                                        <span>Target: 45-55%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-1 text-sm">
                                                        <span className="font-medium text-[#010100]">Fats</span>
                                                        <span className={analyticsData.macroBreakdown.fats < 15 ? "text-orange-500 font-medium" : "text-green-500 font-medium"}>
                                                            {analyticsData.macroBreakdown.fats < 15 ? "Low" : "Optimal"}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                        <div
                                                            className={analyticsData.macroBreakdown.fats < 15 ? "bg-orange-400 h-2.5 rounded-full" : "bg-green-400 h-2.5 rounded-full"}
                                                            style={{ width: `${analyticsData.macroBreakdown.fats}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                        <span>Current: {analyticsData.macroBreakdown.fats}%</span>
                                                        <span>Target: 20-35%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Food Suggestions */}
                                            <div className="mt-5 bg-white rounded-lg p-4 border border-[#ABD483]/20">
                                                <h5 className="font-medium text-[#010100] mb-2 flex items-center">
                                                    <Lightbulb className="h-4 w-4 mr-1.5 text-[#FC842D]" />
                                                    Suggested High-Protein Foods
                                                </h5>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                                    {["Greek Yogurt", "Chicken Breast", "Eggs", "Tofu", "Lentils", "Cottage Cheese"].map((food, index) => (
                                                        <div key={index} className="text-sm bg-gray-50 py-1.5 px-3 rounded-md text-gray-700 flex items-center">
                                                            <Check className="h-3 w-3 mr-1.5 text-[#8BAA7C]" />
                                                            {food}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Today's Tip Card */}
                                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl overflow-hidden">
                                        <div className="flex items-center border-b border-amber-100 p-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                                                <LightbulbIcon className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <h4 className="font-bold text-amber-800">Today's Nutrition Tip</h4>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-start">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                                    <TrendingUp className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-amber-800 mb-1">Calorie Goal</p>
                                                    <p className="text-amber-700">
                                                        You're currently under your daily calorie goal. Consider adding a nutritious snack to meet your energy needs.
                                                    </p>

                                                    {/* Calorie Progress */}
                                                    <div className="mt-4 bg-white rounded-lg p-3 border border-amber-200">
                                                        <div className="flex justify-between items-center mb-1 text-sm">
                                                            <span className="font-medium text-amber-800">Calorie Intake</span>
                                                            <span className="text-amber-800 font-medium">
                                                                {formatNumber(analyticsData.todayMacros.calories)} / {formatNumber(analyticsData.recommendedMacros.calories)} cal
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-amber-100 rounded-full h-2.5">
                                                            <div className="bg-amber-400 h-2.5 rounded-full" style={{
                                                                width: `${Math.min(100, (analyticsData.todayMacros.calories / analyticsData.recommendedMacros.calories * 100))}%`
                                                            }}></div>
                                                        </div>
                                                        <div className="text-right text-xs text-amber-600 mt-1">
                                                            {formatNumber(analyticsData.recommendedMacros.calories - analyticsData.todayMacros.calories)} calories remaining
                                                        </div>
                                                    </div>

                                                    {/* Snack Suggestions */}
                                                    <div className="mt-4">
                                                        <h5 className="font-medium text-amber-800 mb-2">Quick Healthy Snack Ideas:</h5>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            <div className="bg-white p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                                                                        <Apple className="h-4 w-4 text-amber-600" />
                                                                    </span>
                                                                    <span className="text-amber-800">Apple with 2 tbsp almond butter</span>
                                                                </div>
                                                                <span className="text-xs font-medium bg-amber-100 py-1 px-2 rounded-full text-amber-700">~200 cal</span>
                                                            </div>
                                                            <div className="bg-white p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                                                                        <Milk className="h-4 w-4 text-amber-600" />
                                                                    </span>
                                                                    <span className="text-amber-800">Greek yogurt with berries and honey</span>
                                                                </div>
                                                                <span className="text-xs font-medium bg-amber-100 py-1 px-2 rounded-full text-amber-700">~180 cal</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {!analyticsData && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md p-8 text-center border border-[#ABD483]/20"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Pizza className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-[#010100] mb-2">No Data Available Yet</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                        Start logging your meals to see nutritional insights and analytics on your dashboard.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a
                            href="/profile"
                            className="px-4 py-2 bg-[#8BAA7C] text-white rounded-lg font-medium shadow-sm hover:bg-[#8BAA7C]/90 transition-colors"
                        >
                            Update Profile
                        </a>
                        <a
                            href="/food-log"
                            className="px-4 py-2 bg-white text-[#010100] border border-gray-200 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            Log Food
                        </a>
                    </div>
                </motion.div>
            )}
        </div>
    );
}