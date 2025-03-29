// src/components/dashboard/FoodEntryList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/Providers/AuthProvider';
import { Loader2, Trash2, Image as ImageIcon, Calendar, ChevronDown, Filter, ArrowUpDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Helper function to format date in dd/mm/yyyy
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    // Helper function to format date with day name
    const formatDateWithDay = (dateString: string): string => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };
        return date.toLocaleDateString('en-GB', options);
    };

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
                        const date = formatDate(entry.timestamp);
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

    // Quick date presets
    const setDatePreset = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        setDateRange({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        });
    };

    if (loading && entries.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-[#8BAA7C] mx-auto mb-4" />
                    <p className="text-gray-600">Loading your food entries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="font-DM_Sans">
            <div className="p-6 border-b border-[#ABD483]/20 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-bold text-[#010100] flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-[#8BAA7C]" />
                        Food History
                    </h2>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center px-3 py-1.5 text-[#8BAA7C] bg-white border border-[#ABD483]/30 rounded-lg text-sm font-medium hover:bg-[#ABD483]/5 transition-colors"
                        >
                            <Filter className="h-4 w-4 mr-1.5" />
                            Filter
                            <ChevronDown className={`h-4 w-4 ml-1.5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Quick presets */}
                        <div className="hidden md:flex space-x-1">
                            <button
                                onClick={() => setDatePreset(7)}
                                className="px-2 py-1 text-xs font-medium rounded border border-[#ABD483]/20 hover:bg-[#ABD483]/5 transition-colors"
                            >
                                7d
                            </button>
                            <button
                                onClick={() => setDatePreset(14)}
                                className="px-2 py-1 text-xs font-medium rounded border border-[#ABD483]/20 hover:bg-[#ABD483]/5 transition-colors"
                            >
                                14d
                            </button>
                            <button
                                onClick={() => setDatePreset(30)}
                                className="px-2 py-1 text-xs font-medium rounded border border-[#ABD483]/20 hover:bg-[#ABD483]/5 transition-colors"
                            >
                                30d
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap md:flex-nowrap gap-4 mt-4 p-4 bg-white rounded-lg border border-[#ABD483]/20">
                                <div className="w-full md:w-auto">
                                    <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={dateRange.startDate}
                                        onChange={handleDateRangeChange}
                                        className="block w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8BAA7C] focus:border-[#8BAA7C]"
                                    />
                                </div>

                                <div className="w-full md:w-auto">
                                    <label htmlFor="endDate" className="block text-xs font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={dateRange.endDate}
                                        onChange={handleDateRangeChange}
                                        className="block w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8BAA7C] focus:border-[#8BAA7C]"
                                    />
                                </div>

                                <div className="w-full md:w-auto flex md:items-end md:ml-auto">
                                    <div className="flex space-x-1 mt-auto">
                                        <button
                                            onClick={() => setDatePreset(7)}
                                            className="px-3 py-2 text-sm font-medium rounded-lg border border-[#ABD483]/20 hover:bg-[#ABD483]/5 transition-colors"
                                        >
                                            Last 7 days
                                        </button>
                                        <button
                                            onClick={() => setDatePreset(30)}
                                            className="px-3 py-2 text-sm font-medium rounded-lg border border-[#ABD483]/20 hover:bg-[#ABD483]/5 transition-colors"
                                        >
                                            Last 30 days
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {error && (
                <div className="m-6 p-4 bg-red-50 text-red-700 rounded-lg border-l-4 border-red-500 flex items-start">
                    <div className="mr-3 flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>{error}</div>
                </div>
            )}

            {Object.keys(entriesByDate).length === 0 ? (
                <div className="text-center py-16 px-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No food entries found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        No food entries were found in this date range. Try selecting a different date range or add new food entries.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-[#ABD483]/10">
                    {Object.entries(entriesByDate)
                        .sort((a, b) => {
                            // Parse dd/mm/yyyy format for sorting
                            const [dayA, monthA, yearA] = a[0].split('/').map(Number);
                            const [dayB, monthB, yearB] = b[0].split('/').map(Number);
                            return new Date(yearB, monthB - 1, dayB).getTime() - new Date(yearA, monthA - 1, dayA).getTime();
                        })
                        .map(([date, dayEntries]) => {
                            const dailyTotals = calculateDailyTotals(dayEntries);
                            // Convert dd/mm/yyyy to Date object for formatting with day name
                            const [day, month, year] = date.split('/').map(Number);
                            const dateObj = new Date(year, month - 1, day);

                            return (
                                <div key={date} className="px-6 py-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                                        <h3 className="text-lg font-bold text-[#010100] flex items-center">
                                            {dateObj.toLocaleDateString('en-GB', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </h3>

                                        <div className="flex flex-wrap gap-3 md:gap-6 text-sm md:items-center">
                                            <div className="flex flex-col items-center bg-[#FC842D]/10 px-3 py-1.5 rounded-lg">
                                                <span className="font-bold text-[#FC842D]">{dailyTotals.calories.toFixed(0)}</span>
                                                <span className="text-xs text-gray-500">calories</span>
                                            </div>

                                            <div className="flex gap-3 md:gap-6">
                                                <div className="flex flex-col items-center bg-[#8BAA7C]/10 px-3 py-1.5 rounded-lg">
                                                    <span className="font-bold text-[#8BAA7C]">{dailyTotals.proteins.toFixed(1)}g</span>
                                                    <span className="text-xs text-gray-500">protein</span>
                                                </div>
                                                <div className="flex flex-col items-center bg-[#8BAA7C]/10 px-3 py-1.5 rounded-lg">
                                                    <span className="font-bold text-[#8BAA7C]">{dailyTotals.carbs.toFixed(1)}g</span>
                                                    <span className="text-xs text-gray-500">carbs</span>
                                                </div>
                                                <div className="flex flex-col items-center bg-[#8BAA7C]/10 px-3 py-1.5 rounded-lg">
                                                    <span className="font-bold text-[#8BAA7C]">{dailyTotals.fats.toFixed(1)}g</span>
                                                    <span className="text-xs text-gray-500">fats</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-[#ABD483]/20 overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            <div className="flex items-center">
                                                                Time
                                                                <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            <div className="flex items-center">
                                                                Food
                                                                <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Calories
                                                        </th>
                                                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Protein
                                                        </th>
                                                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Carbs
                                                        </th>
                                                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Fat
                                                        </th>
                                                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {dayEntries
                                                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                                        .map((entry) => (
                                                            <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#010100]">
                                                                    <div className="flex items-center">
                                                                        {entry.imageUrl ? (
                                                                            <div className="flex-shrink-0 h-9 w-9 mr-3">
                                                                                <img
                                                                                    src={entry.imageUrl}
                                                                                    alt={entry.foodName}
                                                                                    className="h-9 w-9 rounded-md object-cover cursor-pointer shadow-sm"
                                                                                    onClick={() => showImageModal(entry.imageUrl!)}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex-shrink-0 h-9 w-9 mr-3 flex items-center justify-center bg-gray-100 rounded-md">
                                                                                <ImageIcon className="h-4 w-4 text-gray-400" />
                                                                            </div>
                                                                        )}
                                                                        {entry.foodName}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-[#FC842D]">
                                                                    {entry.calories.toFixed(0)}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                                                                    {entry.proteins.toFixed(1)} g
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                                                                    {entry.carbs.toFixed(1)} g
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                                                                    {entry.fats.toFixed(1)} g
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                                                    <button
                                                                        onClick={() => handleDeleteEntry(entry._id)}
                                                                        className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-full hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}

            {/* Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center"
                        onClick={closeImageModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative max-w-3xl mx-auto p-2"
                        >
                            <button
                                className="absolute top-4 right-4 text-white bg-black bg-opacity-60 rounded-full p-2 hover:bg-opacity-80 transition-colors z-10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeImageModal();
                                }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <img
                                src={selectedImage}
                                alt="Food entry"
                                className="max-h-[80vh] max-w-full rounded-lg shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}