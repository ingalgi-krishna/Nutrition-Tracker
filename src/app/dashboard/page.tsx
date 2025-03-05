// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import BMICard from '@/components/dashboard/BMICard';
import MacroChart from '@/components/dashboard/MacroChart';
import FoodEntryList from '@/components/dashboard/FoodEntryList';
import Recommendations from '@/components/dashboard/Recommendations';

export default function Dashboard() {
    // For demo purposes, we'll use temporary user ID and data
    // In a real app, this would come from authentication
    const [userId, setUserId] = useState<string>('demo-user-123');
    const [userData, setUserData] = useState({
        name: 'Demo User',
        height: 175, // cm
        weight: 70, // kg
        bmi: 22.9,
        goalType: 'weight_gain' as 'weight_loss' | 'weight_gain' | 'maintain',
    });

    const [nutritionData, setNutritionData] = useState({
        calories: 2200,
        proteins: 110,
        carbs: 220,
        fats: 70,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulate fetching user data
        const fetchUserData = async () => {
            try {
                setLoading(true);

                // In a real app, fetch from your API
                // const response = await fetch(`/api/users/${userId}`);
                // const data = await response.json();
                // if (data.success) setUserData(data.data);

                // For demo, we'll just use the default data with a delay
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Failed to load user data");
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    // For demo, we'll calculate daily stats
    const calculateDailyStats = () => {
        // This function would normally fetch from your API
        // In a real app, you'd aggregate food entries for the day
        return nutritionData;
    };

    const dailyStats = calculateDailyStats();

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
                    <p className="text-gray-600">Loading your dashboard...</p>
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Welcome, {userData.name}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div>
                    <BMICard
                        bmi={userData.bmi}
                        height={userData.height}
                        weight={userData.weight}
                        goalType={userData.goalType}
                    />
                </div>

                <div className="lg:col-span-2">
                    <MacroChart
                        calories={dailyStats.calories}
                        proteins={dailyStats.proteins}
                        carbs={dailyStats.carbs}
                        fats={dailyStats.fats}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <FoodEntryList userId={userId} />
                </div>

                <div>
                    <Recommendations userId={userId} />
                </div>
            </div>
        </div>
    );
}