// src/app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/Providers/AuthProvider';
import {
    Loader2,
    Save,
    User,
    AlertTriangle,
    Scale,
    Activity,
    Utensils,
    Heart,
    Clock,
    Leaf,
    Apple,
    ChevronsUp,
    Award,
    Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileFormData {
    name: string;
    email: string;
    height: string;
    weight: string;
    age: string;
    gender: string;
    goalType: string;
    dietaryPreference: string;
    allergies: string[];
    activityLevel: string;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5 }
    }
};

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        name: '',
        email: '',
        height: '',
        weight: '',
        age: '',
        gender: 'other',
        goalType: 'maintain',
        dietaryPreference: 'non-vegetarian',
        allergies: [],
        activityLevel: 'moderate',
    });
    const [allergyInput, setAllergyInput] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);
    const [bmiCategory, setBmiCategory] = useState<string>('');

    // Calculate BMI
    useEffect(() => {
        if (formData.height && formData.weight) {
            const heightInMeters = Number(formData.height) / 100;
            const weightInKg = Number(formData.weight);
            const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
            setBmi(calculatedBmi);

            // Set BMI category
            if (calculatedBmi < 18.5) {
                setBmiCategory('Underweight');
            } else if (calculatedBmi < 24.9) {
                setBmiCategory('Normal weight');
            } else if (calculatedBmi < 29.9) {
                setBmiCategory('Overweight');
            } else {
                setBmiCategory('Obese');
            }
        } else {
            setBmi(null);
            setBmiCategory('');
        }
    }, [formData.height, formData.weight]);

    // Fetch user data
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                const response = await fetch('/api/users/me');

                if (!response.ok) {
                    throw new Error('Failed to fetch profile data');
                }

                const data = await response.json();

                if (data.success) {
                    setFormData({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        height: data.user.height?.toString() || '',
                        weight: data.user.weight?.toString() || '',
                        age: data.user.age?.toString() || '',
                        gender: data.user.gender || 'other',
                        goalType: data.user.goalType || 'maintain',
                        dietaryPreference: data.user.dietaryPreference || 'non-vegetarian',
                        allergies: data.user.allergies || [],
                        activityLevel: data.user.activityLevel || 'moderate',
                    });
                } else {
                    setError('Failed to load profile data');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Error loading profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [user?.id]);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle number inputs
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Allow empty value or positive numbers
        if (value === '' || (Number(value) >= 0)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle adding allergies
    const addAllergy = () => {
        if (allergyInput.trim() && !formData.allergies.includes(allergyInput.trim())) {
            setFormData(prev => ({
                ...prev,
                allergies: [...prev.allergies, allergyInput.trim()]
            }));
            setAllergyInput('');
        }
    };

    // Handle removing allergies
    const removeAllergy = (index: number) => {
        setFormData(prev => ({
            ...prev,
            allergies: prev.allergies.filter((_, i) => i !== index)
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response = await fetch('/api/users/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    height: formData.height ? Number(formData.height) : undefined,
                    weight: formData.weight ? Number(formData.weight) : undefined,
                    age: formData.age ? Number(formData.age) : undefined,
                    gender: formData.gender,
                    goalType: formData.goalType,
                    dietaryPreference: formData.dietaryPreference,
                    allergies: formData.allergies,
                    activityLevel: formData.activityLevel,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Profile updated successfully!');
                // Scroll to the top to show the success message
                window.scrollTo(0, 0);
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('An error occurred while updating your profile');
        } finally {
            setSaving(false);
        }
    };

    // Get activity level icon
    const getActivityIcon = (level: string) => {
        switch (level) {
            case 'sedentary': return <Clock className="h-5 w-5 text-gray-500" />;
            case 'light': return <Activity className="h-5 w-5 text-blue-400" />;
            case 'moderate': return <Activity className="h-5 w-5 text-green-500" />;
            case 'active': return <Activity className="h-5 w-5 text-orange-500" />;
            case 'very_active': return <ChevronsUp className="h-5 w-5 text-red-500" />;
            default: return <Activity className="h-5 w-5 text-green-500" />;
        }
    };

    // Get goal type icon
    const getGoalIcon = (goalType: string) => {
        switch (goalType) {
            case 'weight_loss': return <Activity className="h-5 w-5 text-red-500" />;
            case 'weight_gain': return <ChevronsUp className="h-5 w-5 text-blue-500" />;
            case 'maintain': return <Heart className="h-5 w-5 text-green-500" />;
            default: return <Heart className="h-5 w-5 text-green-500" />;
        }
    };

    // Get dietary preference icon
    const getDietIcon = (preference: string) => {
        switch (preference) {
            case 'vegetarian': return <Leaf className="h-5 w-5 text-green-500" />;
            case 'vegan': return <Leaf className="h-5 w-5 text-green-600" />;
            case 'non-vegetarian': return <Utensils className="h-5 w-5 text-orange-500" />;
            default: return <Utensils className="h-5 w-5 text-orange-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-[#FEFEFF] font-DM_Sans">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-8 max-w-md"
                >
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-[#ABD483]/20 mx-auto mb-6 flex items-center justify-center">
                            <Loader2 className="animate-spin h-10 w-10 text-[#8BAA7C]" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FC842D] rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#010100] mb-3">Loading Your Profile</h2>
                    <p className="text-gray-600 mb-6">
                        Please wait while we retrieve your profile information.
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5 }}
                            className="h-full bg-gradient-to-r from-[#ABD483] to-[#8BAA7C] rounded-full"
                        ></motion.div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-DM_Sans bg-[#FEFEFF]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#010100]">
                        Your Profile
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Update your personal information and preferences for better nutrition recommendations
                    </p>
                </div>
            </div>

            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-[#ABD483]/10 rounded-lg border border-[#ABD483]/30 flex items-center"
                    >
                        <Award className="h-5 w-5 text-[#8BAA7C] mr-3 flex-shrink-0" />
                        <p className="text-sm font-medium text-[#8BAA7C]">{success}</p>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center"
                    >
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-[#ABD483]/20"
            >
                <form onSubmit={handleSubmit}>
                    {/* Personal Information Section */}
                    <div className="p-6 border-b border-[#ABD483]/10">
                        <h2 className="text-xl font-bold text-[#010100] mb-4 flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#ABD483]/20 mr-3 flex items-center justify-center">
                                <User className="h-4 w-4 text-[#8BAA7C]" />
                            </div>
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-[#ABD483]/20 rounded-lg shadow-sm focus:outline-none focus:ring-[#8BAA7C] focus:border-[#8BAA7C]"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                            </div>

                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleNumberChange}
                                    min="1"
                                    max="120"
                                    className="w-full px-3 py-2 border border-[#ABD483]/20 rounded-lg shadow-sm focus:outline-none focus:ring-[#8BAA7C] focus:border-[#8BAA7C]"
                                />
                            </div>

                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-[#ABD483]/20 rounded-lg shadow-sm focus:outline-none focus:ring-[#8BAA7C] focus:border-[#8BAA7C]"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Body Measurements Section */}
                    <div className="p-6 border-b border-[#ABD483]/10">
                        <h2 className="text-xl font-bold text-[#010100] mb-4 flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#ABD483]/20 mr-3 flex items-center justify-center">
                                <Scale className="h-4 w-4 text-[#8BAA7C]" />
                            </div>
                            Body Measurements
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                                    Height (cm)
                                </label>
                                <input
                                    type="number"
                                    id="height"
                                    name="height"
                                    value={formData.height}
                                    onChange={handleNumberChange}
                                    min="1"
                                    max="300"
                                    className="w-full px-3 py-2 border border-[#ABD483]/20 rounded-lg shadow-sm focus:outline-none focus:ring-[#8BAA7C] focus:border-[#8BAA7C]"
                                />
                            </div>

                            <div>
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleNumberChange}
                                    min="1"
                                    max="500"
                                    className="w-full px-3 py-2 border border-[#ABD483]/20 rounded-lg shadow-sm focus:outline-none focus:ring-[#8BAA7C] focus:border-[#8BAA7C]"
                                />
                            </div>
                        </div>

                        {bmi !== null && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-[#8BAA7C]/10 to-[#ABD483]/10 rounded-xl border border-[#ABD483]/20">
                                <h3 className="font-bold text-[#010100] mb-2 flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-[#ABD483]/20 mr-2 flex items-center justify-center">
                                        <Activity className="h-3 w-3 text-[#8BAA7C]" />
                                    </div>
                                    Body Mass Index (BMI)
                                </h3>

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                                            <div
                                                className={`h-2.5 rounded-full ${bmi < 18.5 ? 'bg-blue-400' :
                                                    bmi < 24.9 ? 'bg-green-400' :
                                                        bmi < 29.9 ? 'bg-orange-400' : 'bg-red-400'
                                                    }`}
                                                style={{ width: `${Math.min(100, (bmi / 40) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Underweight</span>
                                            <span>Normal</span>
                                            <span>Overweight</span>
                                            <span>Obese</span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm border border-[#ABD483]/10 flex gap-4 items-center">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-500">Your BMI</div>
                                            <div className="font-bold text-[#010100] text-lg">{bmi.toFixed(1)}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-500">Category</div>
                                            <div className={`font-bold text-sm ${bmi < 18.5 ? 'text-blue-500' :
                                                bmi < 24.9 ? 'text-green-500' :
                                                    bmi < 29.9 ? 'text-orange-500' : 'text-red-500'
                                                }`}>{bmiCategory}</div>
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-2 text-sm text-gray-600">
                                    BMI is a measure of body fat based on height and weight. It's used to screen for weight categories that may lead to health problems.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Dietary Preferences Section */}
                    <div className="p-6 border-b border-[#ABD483]/10">
                        <h2 className="text-xl font-bold text-[#010100] mb-4 flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#ABD483]/20 mr-3 flex items-center justify-center">
                                <Utensils className="h-4 w-4 text-[#8BAA7C]" />
                            </div>
                            Dietary Preferences
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="goalType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Fitness Goal
                                </label>
                                <div className="flex flex-col space-y-2">
                                    {['weight_loss', 'maintain', 'weight_gain'].map((goal) => (
                                        <label
                                            key={goal}
                                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.goalType === goal
                                                ? 'border-[#8BAA7C] bg-[#8BAA7C]/10'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="goalType"
                                                value={goal}
                                                checked={formData.goalType === goal}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
                                                {goal === 'weight_loss' && <Activity className="h-5 w-5 text-red-500" />}
                                                {goal === 'maintain' && <Heart className="h-5 w-5 text-green-500" />}
                                                {goal === 'weight_gain' && <ChevronsUp className="h-5 w-5 text-blue-500" />}
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-medium text-[#010100]">
                                                    {goal === 'weight_loss' ? 'Weight Loss' :
                                                        goal === 'weight_gain' ? 'Weight Gain' : 'Maintain Weight'}
                                                </span>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.goalType === goal ? 'border-[#8BAA7C]' : 'border-gray-300'
                                                }`}>
                                                {formData.goalType === goal && (
                                                    <div className="w-2 h-2 rounded-full bg-[#8BAA7C]"></div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="dietaryPreference" className="block text-sm font-medium text-gray-700 mb-1">
                                    Dietary Preference
                                </label>
                                <div className="flex flex-col space-y-2">
                                    {['non-vegetarian', 'vegetarian', 'vegan'].map((diet) => (
                                        <label
                                            key={diet}
                                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.dietaryPreference === diet
                                                ? 'border-[#8BAA7C] bg-[#8BAA7C]/10'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="dietaryPreference"
                                                value={diet}
                                                checked={formData.dietaryPreference === diet}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
                                                {diet === 'non-vegetarian' && <Utensils className="h-5 w-5 text-orange-500" />}
                                                {diet === 'vegetarian' && <Leaf className="h-5 w-5 text-green-500" />}
                                                {diet === 'vegan' && <Leaf className="h-5 w-5 text-green-600" />}
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-medium text-[#010100] capitalize">{diet}</span>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.dietaryPreference === diet ? 'border-[#8BAA7C]' : 'border-gray-300'
                                                }`}>
                                                {formData.dietaryPreference === diet && (
                                                    <div className="w-2 h-2 rounded-full bg-[#8BAA7C]"></div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">
                                    Activity Level
                                </label>
                                <select
                                    id="activityLevel"
                                    name="activityLevel"
                                    value={formData.activityLevel}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-[#ABD483]/20 rounded-lg shadow-sm focus:outline-none focus:ring-[#8BAA7C] focus:border-[#8BAA7C]"
                                >
                                    <option value="sedentary">Sedentary (little or no exercise)</option>
                                    <option value="light">Light (light exercise 1-3 days/week)</option>
                                    <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                                    <option value="active">Active (hard exercise 6-7 days/week)</option>
                                    <option value="very_active">Very Active (very hard exercise & physical job)</option>
                                </select>
                                <div className="mt-2 flex items-center">
                                    <div className="w-4 h-4 mr-1.5">
                                        {getActivityIcon(formData.activityLevel)}
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Your activity level helps us calculate your daily calorie needs.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Food Allergies
                                </label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={allergyInput}
                                        onChange={(e) => setAllergyInput(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-[#ABD483]/20 rounded-l-lg shadow-sm focus:outline-none focus:ring-[#8BAA7C] focus:border-[#8BAA7C]"
                                        placeholder="E.g., peanuts, shellfish"
                                    />
                                    <button
                                        type="button"
                                        onClick={addAllergy}
                                        className="px-4 py-2 bg-[#8BAA7C] text-white font-medium rounded-r-lg hover:bg-[#8BAA7C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BAA7C]"
                                    >
                                        Add
                                    </button>
                                </div>

                                {formData.allergies.length > 0 ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {formData.allergies.map((allergy, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100"
                                            >
                                                <Ban className="h-3 w-3 mr-1 text-red-500" />
                                                {allergy}
                                                <button
                                                    type="button"
                                                    onClick={() => removeAllergy(index)}
                                                    className="ml-1.5 text-red-400 hover:text-red-600 focus:outline-none"
                                                >
                                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-2 text-xs text-gray-600 flex items-center">
                                        <Ban className="h-3 w-3 mr-1 text-gray-400" />
                                        No allergies added yet. Your recommendations will include all foods.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Nutritional Impact Section */}
                    <div className="p-6 bg-gradient-to-r from-[#8BAA7C]/5 to-[#ABD483]/10 border-b border-[#ABD483]/10">
                        <h2 className="text-xl font-bold text-[#010100] mb-4 flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#ABD483]/20 mr-3 flex items-center justify-center">
                                <Apple className="h-4 w-4 text-[#8BAA7C]" />
                            </div>
                            How This Affects Your Nutrition Plan
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-[#ABD483]/20">
                                <div className="flex items-center mb-2">
                                    {getGoalIcon(formData.goalType)}
                                    <h3 className="ml-2 font-bold text-[#010100]">Goal Impact</h3>
                                </div>
                                <p className="text-sm text-gray-700">
                                    {formData.goalType === 'weight_loss'
                                        ? 'Your calorie recommendations will be reduced to create a deficit for weight loss.'
                                        : formData.goalType === 'weight_gain'
                                            ? 'Your calorie recommendations will be increased to support muscle growth and weight gain.'
                                            : 'Your calorie recommendations will match your maintenance needs to sustain your current weight.'}
                                </p>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm border border-[#ABD483]/20">
                                <div className="flex items-center mb-2">
                                    {getDietIcon(formData.dietaryPreference)}
                                    <h3 className="ml-2 font-bold text-[#010100]">Dietary Impact</h3>
                                </div>
                                <p className="text-sm text-gray-700">
                                    {formData.dietaryPreference === 'vegetarian'
                                        ? 'Your food recommendations will exclude meat but include dairy and eggs.'
                                        : formData.dietaryPreference === 'vegan'
                                            ? 'Your food recommendations will exclude all animal products.'
                                            : 'Your food recommendations will include all food types for a balanced diet.'}
                                </p>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm border border-[#ABD483]/20">
                                <div className="flex items-center mb-2">
                                    {getActivityIcon(formData.activityLevel)}
                                    <h3 className="ml-2 font-bold text-[#010100]">Activity Impact</h3>
                                </div>
                                <p className="text-sm text-gray-700">
                                    {formData.activityLevel === 'sedentary'
                                        ? 'Your lower activity level means your calorie needs will be reduced accordingly.'
                                        : formData.activityLevel === 'very_active' || formData.activityLevel === 'active'
                                            ? 'Your high activity level means your calorie and protein needs will be increased to support recovery.'
                                            : 'Your moderate activity level will be factored into a balanced nutrition plan.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="p-6 bg-gray-50 rounded-b-xl text-right">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#8BAA7C] hover:bg-[#8BAA7C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BAA7C] disabled:opacity-50 transition-colors"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}