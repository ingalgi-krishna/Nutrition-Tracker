// src/components/dashboard/Recommendations.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface Recommendation {
    foodName: string;
    reason: string;
    mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface RecommendationsProps {
    userId: string;
}

const Recommendations: React.FC<RecommendationsProps> = ({ userId }) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/recommendations?userId=${userId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch recommendations');
                }

                const data = await response.json();

                if (data.success) {
                    setRecommendations(data.data.recommendations);
                } else {
                    throw new Error(data.error || 'Failed to fetch recommendations');
                }
            } catch (err) {
                console.error('Error fetching recommendations:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchRecommendations();
        }
    }, [userId]);

    if (loading) {
        return <div className="text-center py-6">Loading recommendations...</div>;
    }

    if (error) {
        return <div className="text-center py-6 text-red-500">Error: {error}</div>;
    }

    if (recommendations.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Food Recommendations</h2>
                <div className="text-center py-6 text-gray-500">
                    No recommendations available yet.
                </div>
            </div>
        );
    }

    // Group recommendations by meal time
    const groupedRecommendations = recommendations.reduce((acc, recommendation) => {
        if (!acc[recommendation.mealTime]) {
            acc[recommendation.mealTime] = [];
        }
        acc[recommendation.mealTime].push(recommendation);
        return acc;
    }, {} as Record<string, Recommendation[]>);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Food Recommendations</h2>

            {Object.entries(groupedRecommendations).map(([mealTime, items]) => (
                <div key={mealTime} className="mb-6">
                    <h3 className="text-lg font-medium capitalize mb-3">
                        {mealTime === 'breakfast' && '🍳 Breakfast'}
                        {mealTime === 'lunch' && '🍲 Lunch'}
                        {mealTime === 'dinner' && '🍽️ Dinner'}
                        {mealTime === 'snack' && '🥪 Snack'}
                    </h3>

                    <div className="space-y-4">
                        {items.map((recommendation, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500"
                            >
                                <h4 className="font-medium text-gray-900 mb-1">
                                    {recommendation.foodName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {recommendation.reason}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Recommendations;