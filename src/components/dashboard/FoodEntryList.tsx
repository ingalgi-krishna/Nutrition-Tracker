// src/components/dashboard/FoodEntryList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface FoodEntry {
    _id: string;
    foodName: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    timestamp: string;
    imageUrl?: string;
}

interface FoodEntryListProps {
    userId: string;
}

const FoodEntryList: React.FC<FoodEntryListProps> = ({ userId }) => {
    const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFoodEntries = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/food-entries?userId=${userId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch food entries');
                }

                const data = await response.json();

                if (data.success) {
                    setFoodEntries(data.data);
                } else {
                    throw new Error(data.error || 'Failed to fetch food entries');
                }
            } catch (err) {
                console.error('Error fetching food entries:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchFoodEntries();
        }
    }, [userId]);

    const handleDelete = async (entryId: string) => {
        if (confirm('Are you sure you want to delete this food entry?')) {
            try {
                const response = await fetch(`/api/food-entries/${entryId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete food entry');
                }

                const data = await response.json();

                if (data.success) {
                    // Remove the deleted entry from the state
                    setFoodEntries(prevEntries =>
                        prevEntries.filter(entry => entry._id !== entryId)
                    );
                } else {
                    throw new Error(data.error || 'Failed to delete food entry');
                }
            } catch (err) {
                console.error('Error deleting food entry:', err);
                alert(err instanceof Error ? err.message : 'Failed to delete food entry');
            }
        }
    };

    if (loading) {
        return <div className="text-center py-6">Loading food entries...</div>;
    }

    if (error) {
        return <div className="text-center py-6 text-red-500">Error: {error}</div>;
    }

    if (foodEntries.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Food Entries</h2>
                <div className="text-center py-6 text-gray-500">
                    No food entries found. Start tracking your meals!
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Food Entries</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Food
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Calories
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Macros (g)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {foodEntries.map((entry) => (
                            <tr key={entry._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {entry.imageUrl && (
                                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={entry.imageUrl}
                                                    alt={entry.foodName}
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {entry.foodName}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{entry.calories}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        P: {entry.proteins} | C: {entry.carbs} | F: {entry.fats}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(entry._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FoodEntryList;