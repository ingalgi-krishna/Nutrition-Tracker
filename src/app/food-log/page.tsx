// src/app/food-log/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/Providers/AuthProvider';
import FoodEntryForm from '@/components/dashboard/FoodEntryForm';
import FoodEntryList from '@/components/dashboard/FoodEntryList';
import { motion } from 'framer-motion';
import { Utensils, BookOpen, Info, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function FoodLog() {
    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = useState<number>(0);

    const handleFoodEntrySuccess = () => {
        // Increment the key to trigger a refresh of the FoodEntryList
        setRefreshKey(prev => prev + 1);
    };

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-['DM_Sans']">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ABD483]/20 flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-[#8BAA7C] border-t-transparent rounded-full"></div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#010100] mb-4">Loading...</h1>
                    <p className="text-gray-600">Please wait while we load your food log.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-['DM_Sans'] bg-[#FEFEFF]">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-[#010100] flex items-center">
                        <BookOpen className="mr-3 h-7 w-7 text-[#8BAA7C]" />
                        Your Food Journal
                    </h1>
                    <p className="text-gray-600 mt-1">Track and analyze your daily nutritional intake</p>
                </div>

                <div className="flex gap-2">
                    <Link href="/recommendations" className="flex items-center px-4 py-2 text-[#8BAA7C] bg-[#8BAA7C]/10 rounded-lg hover:bg-[#8BAA7C]/20 transition-colors text-sm font-medium">
                        <Info className="mr-1.5 h-4 w-4" />
                        View Recommendations
                    </Link>
                    <Link href="/analytics" className="flex items-center px-4 py-2 text-white bg-[#8BAA7C] rounded-lg hover:bg-[#8BAA7C]/90 transition-colors text-sm font-medium shadow-sm">
                        <Calendar className="mr-1.5 h-4 w-4" />
                        Nutrition Calendar
                    </Link>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-4"
                >
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#ABD483]/20">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#ABD483]/20 flex items-center justify-center mr-3">
                                <Utensils className="h-5 w-5 text-[#8BAA7C]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#010100]">Add Food Entry</h2>
                        </div>
                        <FoodEntryForm onSuccess={handleFoodEntrySuccess} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-8"
                >
                    <div className="bg-white rounded-xl shadow-sm border border-[#ABD483]/20 overflow-hidden">
                        <FoodEntryList key={refreshKey} />
                    </div>
                </motion.div>
            </div>

            {/* Nutrition Tips Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 p-6 bg-gradient-to-r from-[#8BAA7C]/10 to-[#ABD483]/10 rounded-xl border border-[#ABD483]/20"
            >
                <h3 className="text-lg font-bold text-[#010100] mb-3">Tips for Better Food Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-[#ABD483]/10">
                        <h4 className="font-bold text-[#8BAA7C] text-sm mb-1">Be Consistent</h4>
                        <p className="text-sm text-gray-600">Track your meals at the same time each day to build a habit.</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#ABD483]/10">
                        <h4 className="font-bold text-[#8BAA7C] text-sm mb-1">Use the Camera</h4>
                        <p className="text-sm text-gray-600">Our AI food recognition can save you time by automatically identifying meals.</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#ABD483]/10">
                        <h4 className="font-bold text-[#8BAA7C] text-sm mb-1">Review Weekly</h4>
                        <p className="text-sm text-gray-600">Check your patterns each week to identify areas for improvement.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}