'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculateBMI, getBMICategory } from '@/lib/bmi';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    height: number;
    weight: number;
    bmi: number;
    goalType: 'weight_loss' | 'weight_gain' | 'maintain';
    dietaryPreference?: 'vegetarian' | 'non-vegetarian' | 'vegan';
    allergies?: string[];
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    age?: number;
    gender?: 'male' | 'female' | 'other';
}

export default function ProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        height: '',
        weight: '',
        age: '',
        gender: '',
        dietaryPreference: '',
        activityLevel: '',
        allergies: [] as string[]
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/users/me');

                if (!response.ok) {
                    // If not authenticated, redirect to login
                    if (response.status === 401) {
                        router.push('/auth/login');
                        return;
                    }
                    throw new Error(`Failed to fetch profile: ${response.status}`);
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch profile');
                }

                // Set the user data state
                setUserData(data.data);

                // Initialize the form data with user's current values
                setFormData({
                    name: data.data.name || '',
                    email: data.data.email || '',
                    height: data.data.height ? String(data.data.height) : '',
                    weight: data.data.weight ? String(data.data.weight) : '',
                    age: data.data.age ? String(data.data.age) : '',
                    gender: data.data.gender || '',
                    dietaryPreference: data.data.dietaryPreference || '',
                    activityLevel: data.data.activityLevel || '',
                    allergies: data.data.allergies || []
                });
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setError("Failed to load your profile");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAllergyChange = (allergy: string) => {
        setFormData(prev => {
            const allergies = [...prev.allergies];

            if (allergies.includes(allergy)) {
                return {
                    ...prev,
                    allergies: allergies.filter(a => a !== allergy)
                };
            } else {
                return {
                    ...prev,
                    allergies: [...allergies, allergy]
                };
            }
        });
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
            const age = formData.age ? parseInt(formData.age) : undefined;

            if (!formData.name || !formData.email) {
                throw new Error('Name and email are required');
            }

            if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
                throw new Error('Please enter valid height and weight values');
            }

            if (age !== undefined && (isNaN(age) || age <= 0)) {
                throw new Error('Please enter a valid age');
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

            // Prepare the data for API
            const updateData = {
                name: formData.name,
                email: formData.email,
                height,
                weight,
                age,
                gender: formData.gender || undefined,
                dietaryPreference: formData.dietaryPreference || undefined,
                activityLevel: formData.activityLevel || undefined,
                allergies: formData.allergies
            };

            // Update the user profile
            const response = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error(`Failed to update profile: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to update profile');
            }

            // Update local user data state
            setUserData(data.data);
            setSuccess(true);

            // Scroll to top to show success message
            window.scrollTo(0, 0);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>

            <div className="bg-white shadow-md rounded-lg max-w-3xl mx-auto">
                <div className="md:grid md:grid-cols-3 md:gap-6 p-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Update your personal information and health metrics.
                        </p>

                        {userData?.bmi && (
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
                                    <h4 className="text-sm font-medium text-gray-500">Current Goal</h4>
                                    <p className="mt-1 text-sm font-medium text-indigo-600">
                                        {userData.goalType === 'weight_loss' && 'Weight Loss'}
                                        {userData.goalType === 'weight_gain' && 'Weight Gain'}
                                        {userData.goalType === 'maintain' && 'Maintain Weight'}
                                    </p>
                                </div>

                                {userData.dietaryPreference && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-500">Dietary Preference</h4>
                                        <p className="mt-1 text-sm font-medium text-indigo-600 capitalize">
                                            {userData.dietaryPreference}
                                        </p>
                                    </div>
                                )}
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

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        id="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        min="1"
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                                        Gender
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="dietaryPreference" className="block text-sm font-medium text-gray-700">
                                        Dietary Preference
                                    </label>
                                    <select
                                        id="dietaryPreference"
                                        name="dietaryPreference"
                                        value={formData.dietaryPreference}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">Select preference</option>
                                        <option value="vegetarian">Vegetarian</option>
                                        <option value="non-vegetarian">Non-Vegetarian</option>
                                        <option value="vegan">Vegan</option>
                                    </select>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">
                                        Activity Level
                                    </label>
                                    <select
                                        id="activityLevel"
                                        name="activityLevel"
                                        value={formData.activityLevel}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">Select activity level</option>
                                        <option value="sedentary">Sedentary (little to no exercise)</option>
                                        <option value="light">Light (exercise 1-3 days/week)</option>
                                        <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                                        <option value="active">Active (exercise 6-7 days/week)</option>
                                        <option value="very_active">Very Active (intense exercise daily)</option>
                                    </select>
                                </div>

                                <div className="col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">Allergies</label>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        {['Dairy', 'Nuts', 'Gluten', 'Shellfish', 'Eggs', 'Soy'].map((allergy) => (
                                            <div key={allergy} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`allergy-${allergy}`}
                                                    checked={formData.allergies.includes(allergy)}
                                                    onChange={() => handleAllergyChange(allergy)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor={`allergy-${allergy}`} className="ml-2 text-sm text-gray-700">
                                                    {allergy}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
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