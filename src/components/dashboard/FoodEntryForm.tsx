// src/components/food/FoodEntryForm.tsx
'use client';

import React, { useState } from 'react';

interface FoodEntryFormProps {
    userId: string;
    onSuccess?: () => void;
}

const FoodEntryForm: React.FC<FoodEntryFormProps> = ({ userId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [manualEntry, setManualEntry] = useState(false);
    const [formData, setFormData] = useState({
        foodName: '',
        calories: '',
        proteins: '',
        carbs: '',
        fats: '',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);

            // Create a preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Reset manual entry form when an image is selected
            setManualEntry(false);
            setFormData({
                foodName: '',
                calories: '',
                proteins: '',
                carbs: '',
                fats: '',
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleManualToggle = () => {
        setManualEntry(prev => !prev);
        if (!manualEntry) {
            setImage(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (image) {
                // Handle image upload and analysis
                const reader = new FileReader();
                reader.readAsDataURL(image);
                reader.onloadend = async () => {
                    const base64data = reader.result;

                    // Send image to server for analysis
                    const response = await fetch('/api/upload-image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            imageBase64: base64data,
                            userId,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to analyze food image');
                    }

                    const data = await response.json();

                    if (!data.success) {
                        throw new Error(data.error || 'Failed to analyze food image');
                    }

                    // Create food entry with the analyzed data
                    const { foodName, nutrition } = data.data;

                    const entryResponse = await fetch('/api/food-entries', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId,
                            foodName,
                            calories: nutrition.calories,
                            proteins: nutrition.proteins,
                            carbs: nutrition.carbs,
                            fats: nutrition.fats,
                            imageUrl: imagePreview, // In a real app, you'd use a proper URL
                            timestamp: new Date(),
                        }),
                    });

                    if (!entryResponse.ok) {
                        throw new Error('Failed to save food entry');
                    }

                    const entryData = await entryResponse.json();

                    if (!entryData.success) {
                        throw new Error(entryData.error || 'Failed to save food entry');
                    }

                    setSuccess(true);

                    // Reset form
                    setImage(null);
                    setImagePreview(null);

                    // Call success callback if provided
                    if (onSuccess) {
                        onSuccess();
                    }

                    setLoading(false);
                };
            } else if (manualEntry) {
                // Handle manual entry
                const { foodName, calories, proteins, carbs, fats } = formData;

                if (!foodName || !calories || !proteins || !carbs || !fats) {
                    throw new Error('Please fill in all fields');
                }

                const response = await fetch('/api/food-entries', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        foodName,
                        calories: parseInt(calories),
                        proteins: parseInt(proteins),
                        carbs: parseInt(carbs),
                        fats: parseInt(fats),
                        timestamp: new Date(),
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to save food entry');
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to save food entry');
                }

                setSuccess(true);

                // Reset form
                setFormData({
                    foodName: '',
                    calories: '',
                    proteins: '',
                    carbs: '',
                    fats: '',
                });

                // Call success callback if provided
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                throw new Error('Please select an image or use manual entry');
            }
        } catch (err) {
            console.error('Error submitting food entry:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Food Entry</h2>

            <div className="mb-4">
                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={handleManualToggle}
                        className={`px-4 py-2 rounded-lg ${!manualEntry ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        Scan Food
                    </button>

                    <button
                        type="button"
                        onClick={handleManualToggle}
                        className={`px-4 py-2 rounded-lg ${manualEntry ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        Manual Entry
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    Food entry saved successfully!
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {!manualEntry && (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Food Image
                        </label>

                        {imagePreview ? (
                            <div className="mb-3">
                                <img
                                    src={imagePreview}
                                    alt="Food preview"
                                    className="w-full max-h-48 object-contain rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImage(null);
                                        setImagePreview(null);
                                    }}
                                    className="mt-2 text-sm text-red-600"
                                >
                                    Remove image
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <label className="w-full flex flex-col items-center cursor-pointer">
                                    <svg
                                        className="w-8 h-8 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        ></path>
                                    </svg>
                                    <span className="mt-2 text-sm text-gray-500">
                                        Take a photo or upload an image
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                )}

                {manualEntry && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Food Name
                            </label>
                            <input
                                type="text"
                                name="foodName"
                                value={formData.foodName}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Calories
                            </label>
                            <input
                                type="number"
                                name="calories"
                                value={formData.calories}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Proteins (g)
                                </label>
                                <input
                                    type="number"
                                    name="proteins"
                                    value={formData.proteins}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Carbs (g)
                                </label>
                                <input
                                    type="number"
                                    name="carbs"
                                    value={formData.carbs}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Fats (g)
                                </label>
                                <input
                                    type="number"
                                    name="fats"
                                    value={formData.fats}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Save Food Entry'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FoodEntryForm;