// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { calculateBMI, getBMICategory } from '@/lib/bmi';

export default function Profile() {
    // For demo purposes, we'll use a temporary user ID
    // In a real app, this would come from authentication
    const [userId, setUserId] = useState<string>('demo-user-123');

    const [userData, setUserData] = useState({
        name: 'Demo User',
        email: 'demo@example.com',
        height: 175, // cm
        weight: 70, // kg
        bmi: 22.9,
        goalType: 'maintain' as 'weight_loss' | 'weight_gain' | 'maintain',
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        height: '',
        weight: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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
                    setFormData({
                        name: userData.name,
                        email: userData.email,
                        height: String(userData.height),
                        weight: String(userData.weight),
                    });
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            // Validate inputs
            const height = parseFloat(formData.height);
            const weight = parseFloat(formData.weight);

            if (!formData.name || !formData.email) {
                throw new Error('Name and email are required');
            }

            if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
                throw new Error('Please enter valid height and weight values');
            }

            // Calculate BMI
            const bmi = calculateBMI(height, weight);

            // Determine goal type based on BMI
            let goalType: 'weight_loss' | 'weight_gain' | 'maintain' = 'maintain';
            if (bmi < 18.5) {
                goalType = 'weight_gain';
            } else if (bmi > 25) {
                goalType = 'weight_loss';
            }

            // In a real app, save to your API
            // const response = await fetch(`/api/users/${userId}`, {
            //   method: 'PATCH',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify({
            //     name: formData.name,
            //     email: formData.email,
            //     height,
            //     weight,
            //   }),
            // });
            // 
            // const data = await response.json();
            // if (!data.success) throw new Error(data.error || 'Failed to update profile');

            // For demo, simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update local state
            setUserData({
                ...userData,
                name: formData.name,
                email: formData.email,
                height,
                weight,
                bmi,
                goalType,
            });

            setSuccess(true);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

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
                    <p className="text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

            <div className="bg-white shadow-md rounded-lg max-w-3xl mx-auto">
                <div className="md:grid md:grid-cols-3 md:gap-6 p-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Update your personal information and health metrics.
                        </p>

                        {userData.bmi && (
                            <div className="mt-6 border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-medium text-gray-500">Current BMI</h4>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {userData.bmi.toFixed(1)}
                                </p>
                                <p className={`text-sm ${userData.bmi < 18.5 ? 'text-blue-600' :
                                    userData.bmi < 25 ? 'text-green-600' :
                                        userData.bmi < 30 ? 'text-yellow-600' :
                                            'text-red-600'
                                    }`}>
                                    {getBMICategory(userData.bmi)}
                                </p>

                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-500">Recommended Goal</h4>
                                    <p className="mt-1 text-sm font-medium text-indigo-600">
                                        {userData.goalType === 'weight_loss' && 'Weight Loss'}
                                        {userData.goalType === 'weight_gain' && 'Weight Gain'}
                                        {userData.goalType === 'maintain' && 'Maintain Weight'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-5 md:mt-0 md:col-span-2">
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                                Profile updated successfully!
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        name="height"
                                        id="height"
                                        value={formData.height}
                                        onChange={handleInputChange}
                                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        step="0.1"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        name="weight"
                                        id="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        step="0.1"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}