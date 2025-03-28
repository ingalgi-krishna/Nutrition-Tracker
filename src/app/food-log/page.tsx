// src/app/food-log/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/Providers/AuthProvider';
import FoodEntryForm from '@/components/dashboard/FoodEntryForm';
import FoodEntryList from '@/components/dashboard/FoodEntryList';

export default function FoodLog() {
    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = useState<number>(0);

    const handleFoodEntrySuccess = () => {
        // Increment the key to trigger a refresh of the FoodEntryList
        setRefreshKey(prev => prev + 1);
    };

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading...</h1>
                    <p className="text-gray-600">Please wait while we load your food log.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Food Log</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                    <FoodEntryForm onSuccess={handleFoodEntrySuccess} />
                </div>

                <div className="lg:col-span-2">
                    <FoodEntryList key={refreshKey} />
                </div>
            </div>
        </div>
    );
}