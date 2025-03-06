// src/app/recommendations/page.tsx
'use client';

import { useState, useEffect } from 'react';

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
}

interface NutritionData {
    proteins: number;
    carbs: number;
    fats: number;
    calories?: number;
}

export default function Recommendations() {
    // For demo purposes, we'll use a temporary user ID
    // In a real app, this would come from authentication
    const [userId, setUserId] = useState<string>('demo-user-123');

    const [userData, setUserData] = useState<UserData>({
        bmi: 22.9,
        goalType: 'maintain',
    });

    const [currentNutrition, setCurrentNutrition] = useState<NutritionData>({
        proteins: 110,
        carbs: 220,
        fats: 70,
    });

    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch recommendations from API
        const fetchRecommendations = async () => {
            try {
                setLoading(true);

                // Using a sample user ID for testing - use your actual ID in production
                // For MongoDB, we're using a simple string ID for demo purposes
                // In the API we'll handle string IDs appropriately
                const response = await fetch(`/api/recommendations`);

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
                    });
                    setCurrentNutrition(data.data.currentNutrition);
                    setRecommendations(data.data.recommendations);
                    setLoading(false);
                } else {
                    throw new Error(data.error || 'Failed to fetch recommendations');
                }
            } catch (err) {
                console.error("Error fetching recommendations:", err);
                setError(err instanceof Error ? err.message : "Failed to load recommendations");
                setLoading(false);

                // For demo purposes, if the API fails, we'll show fallback recommendations
                // In a real app, you might want to retry or show a more specific error
                setRecommendations([
                    {
                        foodName: "Idli Sambar",
                        reason: "Balanced meal with protein and complex carbs",
                        nutrition: { proteins: 8, carbs: 30, fats: 5, calories: 230 },
                        mealTime: "breakfast",
                        isVegetarian: true,
                        description: "Steamed rice cakes served with lentil soup"
                    },
                    {
                        foodName: "Tandoori Chicken",
                        reason: "High protein, low carb option for weight management",
                        nutrition: { proteins: 25, carbs: 5, fats: 10, calories: 250 },
                        mealTime: "dinner",
                        isVegetarian: false,
                        description: "Chicken marinated in yogurt and spices, then grilled"
                    }
                ]);
            }
        };

        if (userId) {
            fetchRecommendations();
        }
    }, [userId]);

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
                    <p className="text-gray-600">Generating your Indian food recommendations...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Indian Food Recommendations
            </h1>

            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                    <p className="text-yellow-700">
                        Note: {error}. Showing sample recommendations instead.
                    </p>
                </div>
            )}

            <div className="bg-indigo-50 rounded-lg p-4 mb-8">
                <p className="text-indigo-700">
                    Based on your BMI of <span className="font-semibold">{userData.bmi.toFixed(1)}</span>
                    {userData.bmiCategory && <span> ({userData.bmiCategory})</span>} and
                    goal to <span className="font-semibold">
                        {userData.goalType === 'weight_loss' ? 'lose weight' :
                            userData.goalType === 'weight_gain' ? 'gain weight' :
                                'maintain weight'}
                    </span>,
                    we've customized these recommendations for your nutrition needs.
                </p>
            </div>

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