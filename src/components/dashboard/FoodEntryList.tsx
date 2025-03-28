// src/components/dashboard/FoodEntryList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/Providers/AuthProvider';
import { Loader2, Trash2, Image as ImageIcon } from 'lucide-react';

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

interface FoodEntriesByDate {
    [date: string]: FoodEntry[];
}

export default function FoodEntryList() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [entries, setEntries] = useState<FoodEntry[]>([]);
    const [entriesByDate, setEntriesByDate] = useState<FoodEntriesByDate>({});
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchEntries = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(
                    `/api/food-entries?userId=${user.id}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
                );

                const result = await response.json();

                if (result.success) {
                    setEntries(result.data);

                    // Group entries by date
                    const grouped = result.data.reduce((acc: FoodEntriesByDate, entry: FoodEntry) => {
                        const date = new Date(entry.timestamp).toLocaleDateString();
                        if (!acc[date]) {
                            acc[date] = [];
                        }
                        acc[date].push(entry);
                        return acc;
                    }, {});

                    setEntriesByDate(grouped);
                } else {
                    setError(result.error || 'Failed to load food entries');
                }
            } catch (err) {
                setError('An error occurred while fetching food entries');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, [user?.id, dateRange]);

    const handleDeleteEntry = async (id: string) => {
        if (!confirm('Are you sure you want to delete this food entry?')) {
            return;
        }

        try {
            const response = await fetch(`/api/food-entries/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                // Remove the entry from state
                setEntries(entries.filter(entry => entry._id !== id));

                // Update grouped entries
                const newGrouped = { ...entriesByDate };

                for (const date in newGrouped) {
                    newGrouped[date] = newGrouped[date].filter(entry => entry._id !== id);
                    if (newGrouped[date].length === 0) {
                        delete newGrouped[date];
                    }
                }

                setEntriesByDate(newGrouped);
            } else {
                setError(result.error || 'Failed to delete food entry');
            }
        } catch (err) {
            setError('An error occurred while deleting the food entry');
            console.error(err);
        }
    };

    const calculateDailyTotals = (entries: FoodEntry[]) => {
        return entries.reduce(
            (totals, entry) => {
                totals.calories += entry.calories;
                totals.proteins += entry.proteins;
                totals.carbs += entry.carbs;
                totals.fats += entry.fats;
                return totals;
            },
            { calories: 0, proteins: 0, carbs: 0, fats: 0 }
        );
    };

    const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const showImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

    if (loading && entries.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Food Entries</h2>

                <div className="flex space-x-2">
                    <div>
                        <label htmlFor="startDate" className="block text-xs font-medium text-gray-700">
                            From
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateRangeChange}
                            className="mt-1 block w-full p-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="endDate" className="block text-xs font-medium text-gray-700">
                            To
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateRangeChange}
                            className="mt-1 block w-full p-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {Object.keys(entriesByDate).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No food entries found in this date range.
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(entriesByDate)
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                        .map(([date, dayEntries]) => {
                            const dailyTotals = calculateDailyTotals(dayEntries);

                            return (
                                <div key={date} className="border-b pb-6 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {new Date(date).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </h3>

                                        <div className="flex space-x-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">{dailyTotals.calories.toFixed(0)}</span> cal
                                            </div>
                                            <div>
                                                <span className="font-medium">{dailyTotals.proteins.toFixed(1)}</span> g protein
                                            </div>
                                            <div>
                                                <span className="font-medium">{dailyTotals.carbs.toFixed(1)}</span> g carbs
                                            </div>
                                            <div>
                                                <span className="font-medium">{dailyTotals.fats.toFixed(1)}</span> g fat
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-md border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Time
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Food
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Calories
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Protein
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Carbs
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Fat
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {dayEntries
                                                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                                    .map((entry) => (
                                                        <tr key={entry._id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                <div className="flex items-center">
                                                                    {entry.imageUrl ? (
                                                                        <div className="flex-shrink-0 h-8 w-8 mr-3">
                                                                            <img
                                                                                src={entry.imageUrl}
                                                                                alt={entry.foodName}
                                                                                className="h-8 w-8 rounded-full object-cover cursor-pointer"
                                                                                onClick={() => showImageModal(entry.imageUrl!)}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex-shrink-0 h-8 w-8 mr-3 flex items-center justify-center bg-gray-100 rounded-full">
                                                                            <ImageIcon className="h-4 w-4 text-gray-400" />
                                                                        </div>
                                                                    )}
                                                                    {entry.foodName}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                                                                {entry.calories.toFixed(0)}
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                                                                {entry.proteins.toFixed(1)} g
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                                                                {entry.carbs.toFixed(1)} g
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                                                                {entry.fats.toFixed(1)} g
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                                                <div className="flex justify-end space-x-2">
                                                                    <button
                                                                        onClick={() => handleDeleteEntry(entry._id)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-75 flex items-center justify-center" onClick={closeImageModal}>
                    <div className="relative max-w-2xl mx-auto">
                        <button
                            className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700"
                            onClick={closeImageModal}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Food entry"
                            className="max-h-[80vh] max-w-full rounded shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}