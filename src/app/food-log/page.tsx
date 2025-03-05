// src/app/food-log/page.tsx
'use client';

import { useState, useEffect } from 'react';
import FoodEntryForm from '@/components/dashboard/FoodEntryForm';
import FoodEntryList from '@/components/dashboard/FoodEntryList';

export default function FoodLog() {
    // For demo purposes, we'll use a temporary user ID
    // In a real app, this would come from authentication
    const [userId, setUserId] = useState<string>('demo-user-123');
    const [refreshKey, setRefreshKey] = useState<number>(0);

    const handleFoodEntrySuccess = () => {
        // Increment the key to trigger a refresh of the FoodEntryList
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Food Log</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                    <FoodEntryForm
                        userId={userId}
                        onSuccess={handleFoodEntrySuccess}
                    />
                </div>

                <div className="lg:col-span-2">
                    <FoodEntryList
                        userId={userId}
                        key={refreshKey} // Use key to force re-render on new entries
                    />
                </div>
            </div>
        </div>
    );
}