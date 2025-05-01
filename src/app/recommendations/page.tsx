// src/app/recommendations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/Providers/AuthProvider';
import {
    Loader2,
    RefreshCw,
    Utensils,
    Coffee,
    Sun,
    Moon,
    Cookie,
    AlertTriangle,
    ArrowUpRight,
    Plus,
    User,
    Scale,
    Activity,
    Heart,
    Leaf,
    BarChart,
    Globe,
    MapPin,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IRecommendation } from '@/types/food';

interface Recommendation extends IRecommendation {
    isVegetarian?: boolean;
    description?: string;
}

interface UserData {
    id?: string;
    name?: string;
    bmi: number;
    bmiCategory?: string;
    goalType: 'weight_loss' | 'weight_gain' | 'maintain';
    dietaryPreference?: string;
    country?: string;
    state?: string;
}

interface NutritionData {
    proteins: number;
    carbs: number;
    fats: number;
    calories: number;
}

interface FoodEntry {
    foodName: string;
    mealTime: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    timestamp: string;
}

// Meal time configuration with icons and colors
const mealTimeConfig = {
    breakfast: {
        icon: <Coffee className="h-5 w-5" />,
        smallIcon: <Coffee className="h-3.5 w-3.5 mr-1" />,
        title: "Breakfast",
        gradientFrom: "from-emerald-50",
        gradientTo: "to-green-50",
        tagFrom: "from-green-100",
        tagTo: "to-emerald-100",
        tagText: "text-emerald-800",
        border: "border-emerald-200"
    },
    lunch: {
        icon: <Sun className="h-5 w-5" />,
        smallIcon: <Sun className="h-3.5 w-3.5 mr-1" />,
        title: "Lunch",
        gradientFrom: "from-blue-50",
        gradientTo: "to-sky-50",
        tagFrom: "from-blue-100",
        tagTo: "to-sky-100",
        tagText: "text-sky-800",
        border: "border-sky-200"
    },
    dinner: {
        icon: <Moon className="h-5 w-5" />,
        smallIcon: <Moon className="h-3.5 w-3.5 mr-1" />,
        title: "Dinner",
        gradientFrom: "from-purple-50",
        gradientTo: "to-indigo-50",
        tagFrom: "from-purple-100",
        tagTo: "to-indigo-100",
        tagText: "text-indigo-800",
        border: "border-indigo-200"
    },
    snack: {
        icon: <Cookie className="h-5 w-5" />,
        smallIcon: <Cookie className="h-3.5 w-3.5 mr-1" />,
        title: "Snacks",
        gradientFrom: "from-amber-50",
        gradientTo: "to-yellow-50",
        tagFrom: "from-amber-100",
        tagTo: "to-yellow-100",
        tagText: "text-amber-800",
        border: "border-amber-200"
    }
};

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

export default function Recommendations() {
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [currentNutrition, setCurrentNutrition] = useState<NutritionData | null>(null);
    const [todaysFoodEntries, setTodaysFoodEntries] = useState<FoodEntry[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [mealsToRecommend, setMealsToRecommend] = useState<string[]>([]);

    const handleRefresh = () => {
        setRefreshing(true);
        setRefreshTrigger(prev => prev + 1);
    };

    useEffect(() => {
        // Fetch recommendations from API
        const fetchRecommendations = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/recommendations');

                if (!response.ok) {
                    throw new Error(`API request failed with status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setUserData({
                        id: data.data.user.id,
                        name: data.data.user.name,
                        bmi: data.data.user.bmi,
                        bmiCategory: data.data.user.bmiCategory,
                        goalType: data.data.user.goalType,
                        dietaryPreference: data.data.user.dietaryPreference,
                        country: data.data.user.country,
                        state: data.data.user.state
                    });
                    setCurrentNutrition(data.data.currentNutrition);
                    setTodaysFoodEntries(data.data.todaysFoodEntries || []);
                    setRecommendations(data.data.recommendations);
                    setMealsToRecommend(data.data.mealsToRecommend || []);
                    setLoading(false);
                    setRefreshing(false);
                } else {
                    throw new Error(data.error || 'Failed to fetch recommendations');
                }
            } catch (err) {
                console.error("Error fetching recommendations:", err);
                setError(err instanceof Error ? err.message : "Failed to load recommendations");
                setLoading(false);
                setRefreshing(false);
            }
        };

        if (user?.id) {
            fetchRecommendations();
        }
    }, [user?.id, refreshTrigger]);

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

    // Modify the Bento Grid Layout to create a 2x2 grid
    const renderMealSection = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', items: Recommendation[]) => {
        if (items.length === 0) return null;

        const config = mealTimeConfig[mealType];

        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="mb-12"
            >
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#ABD483]/20 flex items-center justify-center mr-3">
                        {config.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-[#010100]">
                        {config.title} Recommendations
                        {!mealsToRecommend.includes(mealType) && (
                            <span className="ml-3 text-sm font-normal text-gray-500">
                                (Already logged today)
                            </span>
                        )}
                    </h2>
                </div>

                {/* Replace the current grid with a more square 2x2 grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 hover:shadow-md transition-all duration-300"
                        >
                            {/* Card content remains the same */}
                            <div className="relative">
                                <div className={`absolute inset-0 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} rounded-t-xl`}></div>

                                <div className="p-5 border-b border-[#ABD483]/10 relative">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-[#010100] flex items-center">
                                            {item.foodName}
                                            {index === 0 && (
                                                <span className="ml-2 px-2 py-0.5 bg-[#FC842D]/10 text-[#FC842D] text-xs rounded-full font-medium">
                                                    Featured
                                                </span>
                                            )}
                                        </h3>
                                        {item.isVegetarian !== undefined && (
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${item.isVegetarian
                                                ? 'bg-[#ABD483]/20 text-[#8BAA7C]'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {item.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                                            </span>
                                        )}
                                    </div>

                                    {item.description && (
                                        <p className="text-gray-600 text-sm mt-1">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Card Body with Nutrition Facts */}
                            <div className="p-5">
                                {/* Rest of the card content remains the same */}
                                {item.nutrition && (
                                    <div className="absolute top-3 right-3 bg-white rounded-full border border-[#ABD483]/20 shadow-sm h-12 w-12 flex flex-col items-center justify-center">
                                        <span className="text-xs font-bold text-[#FC842D]">{formatNumber(item.nutrition.calories)}</span>
                                        <span className="text-[10px] text-gray-500">kcal</span>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1.5">
                                        {userData?.country ? `Regional Dish - Why This Works For You` : `Why This Works For You`}
                                    </h4>
                                    <p className="text-gray-700 text-sm">
                                        {item.reason}
                                    </p>
                                </div>

                                {item.nutrition && (
                                    <div className="mb-4">
                                        <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1.5">Nutrition Facts</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-[#8BAA7C]/10 p-2 rounded-lg text-center">
                                                <p className="text-sm font-bold text-[#8BAA7C]">{formatNumber(item.nutrition.proteins)}g</p>
                                                <p className="text-xs text-gray-500">protein</p>
                                            </div>
                                            <div className="bg-[#8BAA7C]/10 p-2 rounded-lg text-center">
                                                <p className="text-sm font-bold text-[#8BAA7C]">{formatNumber(item.nutrition.carbs)}g</p>
                                                <p className="text-xs text-gray-500">carbs</p>
                                            </div>
                                            <div className="bg-[#8BAA7C]/10 p-2 rounded-lg text-center">
                                                <p className="text-sm font-bold text-[#8BAA7C]">{formatNumber(item.nutrition.fats)}g</p>
                                                <p className="text-xs text-gray-500">fats</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${config.tagFrom} ${config.tagTo} ${config.tagText}`}>
                                        {config.smallIcon}
                                        <span>{config.title}</span>
                                    </span>

                                    <button className="text-[#8BAA7C] text-sm font-medium hover:text-[#8BAA7C]/80 transition-colors flex items-center">
                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                        Add to Log
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        );
    };

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
                            <Loader2 className="animate-spin h-10 w-10 text-[#8BAA7C]" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FC842D] rounded-full flex items-center justify-center">
                            <Utensils className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#010100] mb-3">Analyzing Your Nutrition</h2>
                    <p className="text-gray-600 mb-6">
                        Our AI is generating personalized meal recommendations based on your profile and dietary needs.
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

    // Group recommendations by meal time
    const breakfast = recommendations.filter(item => item.mealTime === 'breakfast');
    const lunch = recommendations.filter(item => item.mealTime === 'lunch');
    const dinner = recommendations.filter(item => item.mealTime === 'dinner');
    const snacks = recommendations.filter(item => item.mealTime === 'snack');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-DM_Sans bg-[#FEFEFF]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#010100]">
                        Your Personalized Nutrition Plan
                    </h1>
                    <p className="text-gray-600 mt-1">
                        AI-generated recommendations based on your profile, location, and dietary preferences
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-4 py-2.5 bg-[#8BAA7C] text-white rounded-lg hover:bg-[#8BAA7C]/90 focus:outline-none focus:ring-2 focus:ring-[#8BAA7C] focus:ring-offset-2 transition-all duration-200 flex items-center font-medium shadow-sm disabled:opacity-70"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh Recommendations'}
                </button>
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

            {userData && (
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
                                    <span>BMI: <span className="font-semibold">{userData.bmi.toFixed(1)}</span>
                                        {userData.bmiCategory && <span className="text-xs ml-1 text-gray-500">({userData.bmiCategory})</span>}</span>
                                </div>

                                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-[#ABD483]/20">
                                    {getGoalIcon(userData.goalType)}
                                    <span className="ml-1.5 font-semibold capitalize">
                                        {userData.goalType === 'weight_loss' ? 'Weight Loss' :
                                            userData.goalType === 'weight_gain' ? 'Weight Gain' : 'Weight Maintenance'}
                                    </span>
                                </div>

                                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-[#ABD483]/20">
                                    <Leaf className="h-4 w-4 mr-1.5 text-[#8BAA7C]" />
                                    <span className="font-semibold capitalize">
                                        {userData.dietaryPreference || 'No preference'}
                                    </span>
                                </div>

                                {/* Add region information */}
                                {userData.country && (
                                    <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-[#ABD483]/20">
                                        <Globe className="h-4 w-4 mr-1.5 text-[#8BAA7C]" />
                                        <span className="font-semibold">
                                            {userData.country} {userData.state && `, ${userData.state}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {currentNutrition && (
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-[#ABD483]/10 flex gap-4">
                                <div className="text-center px-3 border-r border-gray-100">
                                    <div className="text-sm text-gray-500">Calories</div>
                                    <div className="font-bold text-[#FC842D]">{currentNutrition.calories.toFixed(0)}</div>
                                </div>
                                <div className="text-center px-3 border-r border-gray-100">
                                    <div className="text-sm text-gray-500">Protein</div>
                                    <div className="font-bold text-[#8BAA7C]">{currentNutrition.proteins.toFixed(1)}g</div>
                                </div>
                                <div className="text-center px-3 border-r border-gray-100">
                                    <div className="text-sm text-gray-500">Carbs</div>
                                    <div className="font-bold text-[#8BAA7C]">{currentNutrition.carbs.toFixed(1)}g</div>
                                </div>
                                <div className="text-center px-3">
                                    <div className="text-sm text-gray-500">Fats</div>
                                    <div className="font-bold text-[#8BAA7C]">{currentNutrition.fats.toFixed(1)}g</div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Regional cuisine highlight banner */}
            {userData?.country && userData?.state && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 mb-8 border border-[#ABD483]/20 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#FC842D]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-6 w-6 text-[#FC842D]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-[#010100]">Regional Cuisine Recommendations</h3>
                            <p className="text-gray-600">
                                Your meal recommendations are tailored to include traditional dishes from {userData.state}, {userData.country} that align with your nutritional goals.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Today's food log summary */}
            {todaysFoodEntries.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100"
                >
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-[#010100] flex items-center">
                                <Utensils className="h-5 w-5 mr-2 text-[#8BAA7C]" />
                                Today's Food Log
                            </h2>
                            <button className="text-[#8BAA7C] text-sm font-medium flex items-center hover:text-[#8BAA7C]/80 transition-colors">
                                View Details
                                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Time</th>
                                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food</th>
                                        <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                                        <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Protein</th>
                                        <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Carbs</th>
                                        <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Fats</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {todaysFoodEntries.map((entry, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{entry.timestamp}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#010100]">{entry.foodName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right font-medium">{formatNumber(entry.calories)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{formatNumber(entry.proteins)}g</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{formatNumber(entry.carbs)}g</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{formatNumber(entry.fats)}g</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {currentNutrition && (
                                    <tfoot>
                                        <tr className="bg-gray-50 font-medium">
                                            <td colSpan={2} className="px-4 py-3 text-sm font-bold text-[#010100] rounded-bl-lg">Daily Totals</td>
                                            <td className="px-4 py-3 text-sm font-bold text-[#FC842D] text-right">{formatNumber(currentNutrition.calories)}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-[#010100] text-right">{formatNumber(currentNutrition.proteins)}g</td>
                                            <td className="px-4 py-3 text-sm font-bold text-[#010100] text-right">{formatNumber(currentNutrition.carbs)}g</td>
                                            <td className="px-4 py-3 text-sm font-bold text-[#010100] text-right rounded-br-lg">{formatNumber(currentNutrition.fats)}g</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                            <button className="text-[#8BAA7C] font-medium text-sm flex items-center hover:text-[#8BAA7C]/80 transition-colors">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Food Entry
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="space-y-10">
                <AnimatePresence>
                    {refreshing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#FEFEFF]/80 flex items-center justify-center z-50"
                        >
                            <div className="bg-white p-8 rounded-xl shadow-xl border border-[#ABD483]/20 flex flex-col items-center">
                                <Loader2 className="animate-spin h-10 w-10 text-[#8BAA7C] mb-4" />
                                <p className="text-[#010100] font-medium">Updating your recommendations...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Current time context */}
                {userData && mealsToRecommend && mealsToRecommend.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg p-4 mb-6 border border-[#ABD483]/20 shadow-sm"
                    >
                        <div className="flex items-center">
                            <div className="mr-3 p-2 bg-[#ABD483]/10 rounded-full">
                                <Clock className="h-5 w-5 text-[#8BAA7C]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-[#010100]">Current Meal Suggestions</h3>
                                <p className="text-xs text-gray-600">
                                    Based on the current time, we're recommending: {mealsToRecommend.map(m =>
                                        mealTimeConfig[m as keyof typeof mealTimeConfig].title).join(', ')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Render each meal section using the Bento grid layout */}
                {renderMealSection('breakfast', breakfast)}
                {renderMealSection('lunch', lunch)}
                {renderMealSection('dinner', dinner)}
                {renderMealSection('snack', snacks)}

                {recommendations.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-md p-8 text-center border border-[#ABD483]/20"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Utensils className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-[#010100] mb-2">No Recommendations Yet</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            Please update your profile and log your food intake to get personalized AI-powered nutrition recommendations.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button className="px-4 py-2 bg-[#8BAA7C] text-white rounded-lg font-medium shadow-sm hover:bg-[#8BAA7C]/90 transition-colors">
                                Update Profile
                            </button>
                            <button className="px-4 py-2 bg-white text-[#010100] border border-gray-200 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition-colors">
                                Log Food
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}