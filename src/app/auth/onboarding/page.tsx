// src/app/auth/onboarding/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { OnboardingData } from '@/types/user';

export default function OnboardingForm() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState('');
    const [formData, setFormData] = useState<OnboardingData>({
        height: 0,
        weight: 0,
        goalType: 'maintain',
        dietaryPreference: 'non-vegetarian',
        allergies: [],
        activityLevel: 'moderate',
        age: 0,
        gender: 'other',
    });

    // For allergies input
    const [allergyInput, setAllergyInput] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: parseInt(value) || 0,
        }));
    };

    const addAllergy = () => {
        if (allergyInput.trim() !== '' && !formData.allergies.includes(allergyInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                allergies: [...prev.allergies, allergyInput.trim()],
            }));
            setAllergyInput('');
        }
    };

    const removeAllergy = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            allergies: prev.allergies.filter((_, i) => i !== index),
        }));
    };

    const nextStep = () => {
        if (step === 1) {
            // Validate first step
            if (!formData.height || !formData.weight || !formData.age) {
                setError('Please fill in all required fields');
                return;
            }
        }
        setError('');
        setStep((prev) => prev + 1);
    };

    const prevStep = () => {
        setError('');
        setStep((prev) => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setDebugInfo('Submitting form...');

        try {
            const response = await fetch('/api/auth/onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            setDebugInfo(prev => prev + '\nResponse status: ' + response.status);

            const data = await response.json();
            setDebugInfo(prev => prev + '\nResponse data: ' + JSON.stringify(data));

            if (data.success) {
                setDebugInfo(prev => prev + '\nSuccess! Redirecting...');

                // Store onboarding completion flag
                localStorage.setItem('onboardingCompleted', 'true');

                // Use a full page reload to ensure proper redirection
                window.location.href = '/dashboard';
            } else {
                setError(data.message || 'Failed to complete onboarding');
                setDebugInfo(prev => prev + '\nError: ' + data.message);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setError('An error occurred. Please try again.');
            setDebugInfo(prev => prev + '\nException: ' + errorMsg);
            console.error('Onboarding submission error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Complete Your Profile</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Help us personalize your nutrition recommendations
                    </p>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <div className={`h-1 w-1/3 ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                    <div className={`h-1 w-1/3 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                    <div className={`h-1 w-1/3 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                                        Age (years)
                                    </label>
                                    <input
                                        id="age"
                                        name="age"
                                        type="number"
                                        min="1"
                                        max="120"
                                        required
                                        value={formData.age || ''}
                                        onChange={handleNumberChange}
                                        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                                        Gender
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                                        Height (cm)
                                    </label>
                                    <input
                                        id="height"
                                        name="height"
                                        type="number"
                                        min="50"
                                        max="300"
                                        required
                                        value={formData.height || ''}
                                        onChange={handleNumberChange}
                                        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                                        Weight (kg)
                                    </label>
                                    <input
                                        id="weight"
                                        name="weight"
                                        type="number"
                                        min="20"
                                        max="500"
                                        required
                                        value={formData.weight || ''}
                                        onChange={handleNumberChange}
                                        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800">Dietary Preferences</h3>

                            <div>
                                <label htmlFor="dietaryPreference" className="block text-sm font-medium text-gray-700">
                                    Dietary Preference
                                </label>
                                <select
                                    id="dietaryPreference"
                                    name="dietaryPreference"
                                    value={formData.dietaryPreference}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="non-vegetarian">Non-Vegetarian</option>
                                    <option value="vegetarian">Vegetarian</option>
                                    <option value="vegan">Vegan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Food Allergies or Restrictions
                                </label>
                                <div className="flex mt-1 space-x-2">
                                    <input
                                        type="text"
                                        value={allergyInput}
                                        onChange={(e) => setAllergyInput(e.target.value)}
                                        placeholder="e.g., Peanuts, Shellfish"
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addAllergy}
                                        className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Add
                                    </button>
                                </div>
                                {formData.allergies.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.allergies.map((allergy, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 rounded-md"
                                            >
                                                {allergy}
                                                <button
                                                    type="button"
                                                    onClick={() => removeAllergy(index)}
                                                    className="ml-1 text-gray-500 hover:text-gray-700"
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800">Goals & Activity</h3>

                            <div>
                                <label htmlFor="goalType" className="block text-sm font-medium text-gray-700">
                                    Your Goal
                                </label>
                                <select
                                    id="goalType"
                                    name="goalType"
                                    value={formData.goalType}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="weight_loss">Weight Loss</option>
                                    <option value="weight_gain">Weight Gain</option>
                                    <option value="maintain">Maintain Weight</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">
                                    Activity Level
                                </label>
                                <select
                                    id="activityLevel"
                                    name="activityLevel"
                                    value={formData.activityLevel}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="sedentary">Sedentary (little or no exercise)</option>
                                    <option value="light">Light (light exercise 1-3 days/week)</option>
                                    <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                                    <option value="active">Active (hard exercise 6-7 days/week)</option>
                                    <option value="very_active">Very Active (very hard exercise & physical job)</option>
                                </select>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Previous
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Completing...
                                        </>
                                    ) : (
                                        'Complete Profile'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                {/* Debug information (only visible during development) */}
                {process.env.NODE_ENV !== 'production' && debugInfo && (
                    <div className="p-4 mt-4 overflow-auto text-xs bg-gray-100 rounded whitespace-pre-wrap max-h-40">
                        <strong>Debug Info:</strong>
                        <br />
                        {debugInfo}
                    </div>
                )}
            </div>
        </div>
    );
}