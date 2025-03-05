// src/app/recommendations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { generateRecommendations } from '@/lib/bmi';

interface Recommendation {
    foodName: string;
    reason: string;
    mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface UserData {
    bmi: number;
    goalType: 'weight_loss' | 'weight_gain' | 'maintain';
}

interface NutritionData {
    proteins: number;
    carbs: number;
    fats: number;
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
        // Simulate fetching recommendations
        const fetchRecommendations = async () => {
            try {
                setLoading(true);

                // In a real app, fetch from your API
                // const response = await fetch(`/api/recommendations?userId=${userId}`);
                // const data = await response.json();
                // if (data.success) {
                //   setUserData({
                //     bmi: data.data.user.bmi,
                //     goalType: data.data.user.goalType,
                //   });
                //   setCurrentNutrition(data.data.currentNutrition);
                //   setRecommendations(data.data.recommendations);
                // }

                // For demo, we'll generate recommendations locally with a delay
                setTimeout(() => {
                    const generatedRecommendations = generateRecommendations(
                        userData.bmi,
                        userData.goalType,
                        currentNutrition
                    );
                    setRecommendations(generatedRecommendations);
                    setLoading(false);
                }, 1500);
            } catch (err) {
                console.error("Error fetching recommendations:", err);
                setError("Failed to load recommendations");
                setLoading(false);
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
                    <p className="text-gray-600">Generating your recommendations...</p>
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
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Retry
                    </button>
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
                Food Recommendations
            </h1>

            <div className="bg-indigo-50 rounded-lg p-4 mb-8">
                <p className="text-indigo-700">
                    Based on your BMI of <span className="font-semibold">{userData.bmi.toFixed(1)}</span> and
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
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {item.foodName}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {item.reason}
                                        </p>
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
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {item.foodName}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {item.reason}
                                        </p>
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
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {item.foodName}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {item.reason}
                                        </p>
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
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {item.foodName}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {item.reason}
                                        </p>
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