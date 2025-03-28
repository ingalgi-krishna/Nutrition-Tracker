// src/app/recommendations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/Providers/AuthProvider';
import { Loader2 } from 'lucide-react';

interface Recommendation {
    foodName: string;
    reason: string;
    mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    isVegetarian?: boolean;
    nutrition?: {
        proteins: number;
        carbs: number;
        fats: number;
        calories: number;
    };
    description?: string;
}

interface UserData {
    id?: string;
    name?: string;
    bmi: number;
    bmiCategory?: string;
    goalType: 'weight_loss' | 'weight_gain' | 'maintain';
    dietaryPreference?: string;
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

export default function Recommendations() {
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [currentNutrition, setCurrentNutrition] = useState<NutritionData | null>(null);
    const [todaysFoodEntries, setTodaysFoodEntries] = useState<FoodEntry[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
        setLoading(true);
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
                        dietaryPreference: data.data.user.dietaryPreference
                    });
                    setCurrentNutrition(data.data.currentNutrition);
                    setTodaysFoodEntries(data.data.todaysFoodEntries || []);
                    setRecommendations(data.data.recommendations);
                    setLoading(false);
                } else {
                    throw new Error(data.error || 'Failed to fetch recommendations');
                }
            } catch (err) {
                console.error("Error fetching recommendations:", err);
                setError(err instanceof Error ? err.message : "Failed to load recommendations");
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchRecommendations();
        }
    }, [user?.id, refreshTrigger]);

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading...</h1>
                    <p className="text-gray-600">Please wait while we check your authentication status.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh] bg-gray-50">
                <div className="text-center">
                    <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Generating your personalized food recommendations...</p>
                </div>
            </div>
        );
    }

    // Group recommendations by meal time
    const breakfast = recommendations.filter(item => item.mealTime === 'breakfast');
    const lunch = recommendations.filter(item => item.mealTime === 'lunch');
    const dinner = recommendations.filter(item => item.mealTime === 'dinner');
    const snacks = recommendations.filter(item => item.mealTime === 'snack');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Food Recommendations
                </h1>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Refresh Recommendations
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                    <p className="text-red-700">
                        Error: {error}
                    </p>
                </div>
            )}

            {userData && (
                <div className="bg-indigo-50 rounded-lg p-4 mb-8">
                    <p className="text-indigo-700">
                        Based on your BMI of <span className="font-semibold">{userData.bmi.toFixed(1)}</span>
                        {userData.bmiCategory && <span> ({userData.bmiCategory})</span>},
                        goal to <span className="font-semibold">
                            {userData.goalType === 'weight_loss' ? 'lose weight' :
                                userData.goalType === 'weight_gain' ? 'gain weight' :
                                    'maintain weight'}
                        </span>
                        {userData.dietaryPreference && (
                            <span> and {userData.dietaryPreference} dietary preference</span>
                        )},
                        we've customized these recommendations for your nutrition needs.
                    </p>
                </div>
            )}

            {/* Today's food log summary */}
            {todaysFoodEntries.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div className="px-6 py-4 bg-gray-50 border-b">
                        <h2 className="text-lg font-semibold text-gray-800">Today's Food Log Summary</h2>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food</th>
                                        <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                                        <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Protein</th>
                                        <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Carbs</th>
                                        <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fats</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {todaysFoodEntries.map((entry, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{entry.timestamp}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{entry.foodName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{entry.calories.toFixed(0)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{entry.proteins.toFixed(1)}g</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{entry.carbs.toFixed(1)}g</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{entry.fats.toFixed(1)}g</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {currentNutrition && (
                                    <tfoot>
                                        <tr className="bg-gray-50">
                                            <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-900">Daily Totals</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{currentNutrition.calories.toFixed(0)}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{currentNutrition.proteins.toFixed(1)}g</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{currentNutrition.carbs.toFixed(1)}g</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{currentNutrition.fats.toFixed(1)}g</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {breakfast.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🍳</span> Breakfast
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {breakfast.map((item, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {item.foodName}
                                            </h3>
                                            {item.isVegetarian !== undefined && (
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${item.isVegetarian ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {item.isVegetarian ? 'Veg' : 'Non-Veg'}
                                                </span>
                                            )}
                                        </div>

                                        {item.description && (
                                            <p className="text-gray-500 text-sm mb-3 italic">
                                                {item.description}
                                            </p>
                                        )}

                                        <p className="text-gray-600 mb-4">
                                            {item.reason}
                                        </p>

                                        {item.nutrition && (
                                            <div className="bg-gray-50 p-3 rounded mb-4">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Nutrition</h4>
                                                <div className="grid grid-cols-4 gap-2 text-center">
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.calories}</p>
                                                        <p className="text-xs text-gray-500">cal</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.proteins}g</p>
                                                        <p className="text-xs text-gray-500">protein</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.carbs}g</p>
                                                        <p className="text-xs text-gray-500">carbs</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.fats}g</p>
                                                        <p className="text-xs text-gray-500">fat</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            Breakfast
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {lunch.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🍲</span> Lunch
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {lunch.map((item, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {item.foodName}
                                            </h3>
                                            {item.isVegetarian !== undefined && (
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${item.isVegetarian ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {item.isVegetarian ? 'Veg' : 'Non-Veg'}
                                                </span>
                                            )}
                                        </div>

                                        {item.description && (
                                            <p className="text-gray-500 text-sm mb-3 italic">
                                                {item.description}
                                            </p>
                                        )}

                                        <p className="text-gray-600 mb-4">
                                            {item.reason}
                                        </p>

                                        {item.nutrition && (
                                            <div className="bg-gray-50 p-3 rounded mb-4">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Nutrition</h4>
                                                <div className="grid grid-cols-4 gap-2 text-center">
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.calories}</p>
                                                        <p className="text-xs text-gray-500">cal</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.proteins}g</p>
                                                        <p className="text-xs text-gray-500">protein</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.carbs}g</p>
                                                        <p className="text-xs text-gray-500">carbs</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.fats}g</p>
                                                        <p className="text-xs text-gray-500">fat</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            Lunch
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {dinner.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🍽️</span> Dinner
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {dinner.map((item, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {item.foodName}
                                            </h3>
                                            {item.isVegetarian !== undefined && (
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${item.isVegetarian ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {item.isVegetarian ? 'Veg' : 'Non-Veg'}
                                                </span>
                                            )}
                                        </div>

                                        {item.description && (
                                            <p className="text-gray-500 text-sm mb-3 italic">
                                                {item.description}
                                            </p>
                                        )}

                                        <p className="text-gray-600 mb-4">
                                            {item.reason}
                                        </p>

                                        {item.nutrition && (
                                            <div className="bg-gray-50 p-3 rounded mb-4">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Nutrition</h4>
                                                <div className="grid grid-cols-4 gap-2 text-center">
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.calories}</p>
                                                        <p className="text-xs text-gray-500">cal</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.proteins}g</p>
                                                        <p className="text-xs text-gray-500">protein</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.carbs}g</p>
                                                        <p className="text-xs text-gray-500">carbs</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.fats}g</p>
                                                        <p className="text-xs text-gray-500">fat</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                            Dinner
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {snacks.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🥪</span> Snacks
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {snacks.map((item, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {item.foodName}
                                            </h3>
                                            {item.isVegetarian !== undefined && (
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${item.isVegetarian ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {item.isVegetarian ? 'Veg' : 'Non-Veg'}
                                                </span>
                                            )}
                                        </div>

                                        {item.description && (
                                            <p className="text-gray-500 text-sm mb-3 italic">
                                                {item.description}
                                            </p>
                                        )}

                                        <p className="text-gray-600 mb-4">
                                            {item.reason}
                                        </p>

                                        {item.nutrition && (
                                            <div className="bg-gray-50 p-3 rounded mb-4">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Nutrition</h4>
                                                <div className="grid grid-cols-4 gap-2 text-center">
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.calories}</p>
                                                        <p className="text-xs text-gray-500">cal</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.proteins}g</p>
                                                        <p className="text-xs text-gray-500">protein</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.carbs}g</p>
                                                        <p className="text-xs text-gray-500">carbs</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.nutrition.fats}g</p>
                                                        <p className="text-xs text-gray-500">fat</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                            Snack
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {recommendations.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-gray-600">
                            No personalized recommendations available yet. Please update your profile and log your food intake to get personalized recommendations.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}