// src/components/WaterIntakeStatus.tsx
'use client';

import { useState, useEffect } from 'react';
import { Droplet, RefreshCw, Loader2, Plus, Thermometer, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/components/Providers/AuthProvider';

interface WaterData {
    totalIntake: number;
    waterIntakeGoal: number;
    progress: number;
    unit: string;
    climateAdjustmentFactor?: number;
    adjustedRecommendation?: number;
}

export default function WaterIntakeStatus() {
    const { user } = useAuth();
    const [waterData, setWaterData] = useState<WaterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<boolean>(false);
    const [currentMonth, setCurrentMonth] = useState<string>('');

    const fetchWaterData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/water-intake');

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();

            if (data.success) {
                setWaterData({
                    totalIntake: data.data.totalIntake,
                    waterIntakeGoal: data.data.waterIntakeGoal,
                    progress: data.data.progress,
                    unit: data.data.unit,
                    climateAdjustmentFactor: data.data.climateAdjustmentFactor,
                    adjustedRecommendation: data.data.adjustedRecommendation
                });
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error("Error fetching water data:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaterData();
        // Set current month name
        setCurrentMonth(new Date().toLocaleString('default', { month: 'long' }));
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-4 border border-[#ABD483]/20 h-[140px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-[#8BAA7C] animate-spin" />
            </div>
        );
    }

    if (error || !waterData) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-4 border border-[#ABD483]/20">
                <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Unable to load water data</p>
                    <button
                        onClick={fetchWaterData}
                        className="mt-2 text-[#8BAA7C] text-xs font-medium flex items-center mx-auto"
                    >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Calculate if the climate adjustment is significant (more than 5%)
    const hasSignificantAdjustment = waterData.climateAdjustmentFactor &&
        Math.abs(waterData.climateAdjustmentFactor - 1) > 0.05;

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-[#ABD483]/20">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#010100] flex items-center">
                    <Droplet className="h-4 w-4 mr-1.5 text-sky-500" />
                    Water Intake
                </h3>
                <Link
                    href="/water-tracker"
                    className="text-xs text-[#8BAA7C] font-medium hover:text-[#8BAA7C]/80"
                >
                    View All
                </Link>
            </div>

            <div className="mb-3">
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${waterData.progress}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full"
                    ></motion.div>
                </div>
                <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                    <div>{waterData.progress}%</div>
                    <div>{waterData.totalIntake} / {waterData.waterIntakeGoal} ml</div>
                </div>
            </div>

            {/* Climate adjustment indicator - new section */}
            {hasSignificantAdjustment && user?.country && (
                <div className="mb-3 bg-blue-50 rounded-lg p-2 text-xs">
                    <div className="flex items-center text-blue-700">
                        <Thermometer className="h-3.5 w-3.5 text-blue-500 mr-1.5 flex-shrink-0" />
                        <div className="flex flex-wrap items-center">
                            <span className="font-medium mr-1">Climate-adjusted:</span>
                            <span>
                                {waterData.climateAdjustmentFactor && waterData.climateAdjustmentFactor > 1
                                    ? `+${Math.round((waterData.climateAdjustmentFactor - 1) * 100)}%`
                                    : `${Math.round((waterData.climateAdjustmentFactor! - 1) * 100)}%`}
                            </span>
                            {user.country && (
                                <span className="flex items-center ml-1 text-blue-600">
                                    <MapPin className="h-3 w-3 mx-0.5" />
                                    {user.country} • {currentMonth}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Link
                href="/water-tracker"
                className="w-full py-2 mt-2 bg-[#8BAA7C]/10 hover:bg-[#8BAA7C]/20 text-[#8BAA7C] rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
            >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Water
            </Link>
        </div>
    );
}