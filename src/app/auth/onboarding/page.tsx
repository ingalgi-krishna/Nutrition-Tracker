// src/app/auth/onboarding/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Loader2,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    User,
    Scale,
    Ruler,
    Calendar,
    Utensils,
    AlertTriangle,
    ActivitySquare,
    Target,
    X,
    PlusCircle
} from 'lucide-react';
import { OnboardingData } from '@/types/user';
import { motion, AnimatePresence } from 'framer-motion';

const dietaryOptions: { value: OnboardingData['dietaryPreference']; label: string; description: string; icon: string }[] = [
    { value: 'non-vegetarian', label: 'Non-Vegetarian', description: 'Includes all food groups', icon: '🥩' },
    { value: 'vegetarian', label: 'Vegetarian', description: 'No meat, may include dairy & eggs', icon: '🧀' },
    { value: 'vegan', label: 'Vegan', description: 'No animal products', icon: '🥦' },
    { value: 'pescatarian', label: 'Pescatarian', description: 'Vegetarian + seafood', icon: '🐟' },
    { value: 'keto', label: 'Keto', description: 'Low-carb, high-fat', icon: '🥑' },
    { value: 'paleo', label: 'Paleo', description: 'Whole foods, no processed items', icon: '🍖' },
];

const activityOptions = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise', icon: '💺' },
    { value: 'light', label: 'Light', description: 'Light exercise 1-3 days/week', icon: '🚶' },
    { value: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week', icon: '🏃' },
    { value: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week', icon: '🏋️' },
    { value: 'very_active', label: 'Very Active', description: 'Very hard exercise & physical job', icon: '⚡' },
];

const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss', description: 'Reduce body weight', icon: '📉' },
    { value: 'weight_gain', label: 'Weight Gain', description: 'Increase body weight & muscle', icon: '📈' },
    { value: 'maintain', label: 'Maintain Weight', description: 'Stay at current weight', icon: '⚖️' },
    { value: 'muscle_gain', label: 'Build Muscle', description: 'Increase muscle mass', icon: '💪' },
    { value: 'improve_health', label: 'Improve Health', description: 'Better overall wellbeing', icon: '❤️' },
];

const commonAllergies = [
    "Peanuts", "Tree Nuts", "Milk", "Eggs", "Wheat", "Soy", "Fish", "Shellfish", "Gluten"
];

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

    // Calculate BMI and TDEE
    const [bmi, setBmi] = useState<number | null>(null);
    const [idealWeight, setIdealWeight] = useState<number | null>(null);
    const [tdee, setTdee] = useState<number | null>(null);

    // For allergies input
    const [allergyInput, setAllergyInput] = useState('');
    const [showCommonAllergies, setShowCommonAllergies] = useState(false);

    useEffect(() => {
        if (formData.height > 0 && formData.weight > 0) {
            // Calculate BMI: weight(kg) / (height(m) * height(m))
            const heightInMeters = formData.height / 100;
            const bmiValue = formData.weight / (heightInMeters * heightInMeters);
            setBmi(parseFloat(bmiValue.toFixed(1)));

            // Calculate ideal weight using Hamwi formula (adjusted for metric)
            let ideal = 0;
            if (formData.gender === 'male') {
                ideal = 48 + 2.7 * ((formData.height - 152.4) / 2.54);
            } else if (formData.gender === 'female') {
                ideal = 45.5 + 2.2 * ((formData.height - 152.4) / 2.54);
            } else {
                // Average of male and female formulas for non-binary
                const malIdeal = 48 + 2.7 * ((formData.height - 152.4) / 2.54);
                const femaleIdeal = 45.5 + 2.2 * ((formData.height - 152.4) / 2.54);
                ideal = (malIdeal + femaleIdeal) / 2;
            }
            setIdealWeight(parseFloat(ideal.toFixed(1)));

            // Calculate TDEE (Total Daily Energy Expenditure)
            // First calculate BMR using Mifflin-St Jeor Equation
            let bmr = 0;
            if (formData.gender === 'male') {
                bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age + 5;
            } else {
                bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age - 161;
            }

            // Apply activity multiplier
            let activityMultiplier = 1.2; // Default sedentary
            switch (formData.activityLevel) {
                case 'sedentary':
                    activityMultiplier = 1.2;
                    break;
                case 'light':
                    activityMultiplier = 1.375;
                    break;
                case 'moderate':
                    activityMultiplier = 1.55;
                    break;
                case 'active':
                    activityMultiplier = 1.725;
                    break;
                case 'very_active':
                    activityMultiplier = 1.9;
                    break;
            }

            const tdeeValue = bmr * activityMultiplier;
            setTdee(Math.round(tdeeValue));
        }
    }, [formData.height, formData.weight, formData.age, formData.gender, formData.activityLevel]);

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

    const addCommonAllergy = (allergy: string) => {
        if (!formData.allergies.includes(allergy)) {
            setFormData((prev) => ({
                ...prev,
                allergies: [...prev.allergies, allergy],
            }));
        }
    };

    const removeAllergy = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            allergies: prev.allergies.filter((_, i) => i !== index),
        }));
    };

    const validateStep = (currentStep: number): boolean => {
        setError('');

        switch (currentStep) {
            case 1:
                if (!formData.height || !formData.weight || !formData.age) {
                    setError('Please fill in all required fields');
                    return false;
                }
                if (formData.height < 50 || formData.height > 300) {
                    setError('Please enter a valid height between 50cm and 300cm');
                    return false;
                }
                if (formData.weight < 20 || formData.weight > 500) {
                    setError('Please enter a valid weight between 20kg and 500kg');
                    return false;
                }
                if (formData.age < 1 || formData.age > 120) {
                    setError('Please enter a valid age between 1 and 120 years');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (!validateStep(step)) return;
        setStep((prev) => prev + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setError('');
        setStep((prev) => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep(step)) return;

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

    const getBmiCategory = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
        if (bmi < 25) return { label: 'Healthy', color: 'text-green-500' };
        if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-500' };
        return { label: 'Obese', color: 'text-red-500' };
    };

    const renderProgressBar = () => {
        return (
            <div className="relative mb-12">
                <div className="h-1 w-full bg-gray-200 rounded-full">
                    <div
                        className="h-1 bg-gradient-to-r from-[#8BAA7C] to-[#ABD483] rounded-full"
                        style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-2">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#8BAA7C] text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                            {step > 1 ? <CheckCircle size={16} /> : 1}
                        </div>
                        <span className={`text-xs mt-1 ${step >= 1 ? 'text-[#8BAA7C] font-medium' : 'text-gray-500'}`}>
                            Basics
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#8BAA7C] text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                            {step > 2 ? <CheckCircle size={16} /> : 2}
                        </div>
                        <span className={`text-xs mt-1 ${step >= 2 ? 'text-[#8BAA7C] font-medium' : 'text-gray-500'}`}>
                            Diet
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#8BAA7C] text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                            {step > 3 ? <CheckCircle size={16} /> : 3}
                        </div>
                        <span className={`text-xs mt-1 ${step >= 3 ? 'text-[#8BAA7C] font-medium' : 'text-gray-500'}`}>
                            Goals
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FEFEFF] py-12 px-4 sm:px-6 lg:px-8 font-['DM_Sans']">
            <div className="w-full max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-8 bg-white rounded-2xl shadow-xl border border-[#ABD483]/20"
                >
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-[#010100]">
                            Complete Your Profile
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Help us personalize your nutrition recommendations with Kcalculate AI
                        </p>
                    </div>

                    {renderProgressBar()}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 mb-6 flex items-start space-x-3 text-sm text-red-700 bg-red-50 rounded-lg border-l-4 border-red-500"
                        >
                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center space-x-2 text-[#8BAA7C] mb-6">
                                        <User size={20} />
                                        <h3 className="text-xl font-bold text-[#010100]">
                                            Tell us about yourself
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                                                Age (years)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="age"
                                                    name="age"
                                                    type="number"
                                                    min="1"
                                                    max="120"
                                                    required
                                                    value={formData.age || ''}
                                                    onChange={handleNumberChange}
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8BAA7C] focus:border-transparent transition-colors"
                                                    placeholder="Enter your age"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                                Gender
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <select
                                                    id="gender"
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8BAA7C] focus:border-transparent transition-colors"
                                                >
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                                                Height (cm)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Ruler className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="height"
                                                    name="height"
                                                    type="number"
                                                    min="50"
                                                    max="300"
                                                    required
                                                    value={formData.height || ''}
                                                    onChange={handleNumberChange}
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8BAA7C] focus:border-transparent transition-colors"
                                                    placeholder="Enter your height"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                                                Weight (kg)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Scale className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="weight"
                                                    name="weight"
                                                    type="number"
                                                    min="20"
                                                    max="500"
                                                    required
                                                    value={formData.weight || ''}
                                                    onChange={handleNumberChange}
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8BAA7C] focus:border-transparent transition-colors"
                                                    placeholder="Enter your weight"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {bmi !== null && idealWeight !== null && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3, duration: 0.5 }}
                                            className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200"
                                        >
                                            <h4 className="text-lg font-bold text-[#010100] mb-4">Your Health Metrics</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-white rounded-lg shadow-sm">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">BMI</span>
                                                        <span className={`text-sm font-medium ${getBmiCategory(bmi).color}`}>
                                                            {getBmiCategory(bmi).label}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 text-2xl font-bold">{bmi}</div>
                                                    <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                                                        <div
                                                            className={`h-2 rounded-full ${bmi < 18.5 ? 'bg-blue-500' :
                                                                bmi < 25 ? 'bg-green-500' :
                                                                    bmi < 30 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${Math.min(bmi / 40 * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white rounded-lg shadow-sm">
                                                    <div className="text-sm text-gray-500">Ideal Weight Range</div>
                                                    <div className="mt-1 text-2xl font-bold">{(idealWeight * 0.9).toFixed(1)} - {(idealWeight * 1.1).toFixed(1)} kg</div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Based on your height and gender
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="flex justify-end pt-6">
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="group px-6 py-3 text-white bg-[#FC842D] rounded-lg font-bold shadow-lg shadow-[#FC842D]/20 hover:shadow-xl hover:shadow-[#FC842D]/30 focus:outline-none focus:ring-2 focus:ring-[#FC842D] focus:ring-offset-2 transition-all duration-300 flex items-center"
                                        >
                                            <span>Continue</span>
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center space-x-2 text-[#8BAA7C] mb-6">
                                        <Utensils size={20} />
                                        <h3 className="text-xl font-bold text-[#010100]">
                                            Dietary Preferences
                                        </h3>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Your Diet Type
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {dietaryOptions.map((option) => (
                                                <div
                                                    key={option.value}
                                                    onClick={() => setFormData(prev => ({ ...prev, dietaryPreference: option.value }))}
                                                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${formData.dietaryPreference === option.value
                                                        ? 'border-[#8BAA7C] bg-[#8BAA7C]/10 shadow-md'
                                                        : 'border-gray-200 hover:border-[#8BAA7C]/50 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-2xl">{option.icon}</span>
                                                        {formData.dietaryPreference === option.value && (
                                                            <CheckCircle className="h-5 w-5 text-[#8BAA7C]" />
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold text-[#010100]">{option.label}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Food Allergies or Restrictions
                                        </label>
                                        <div className="flex mt-1 space-x-2">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <AlertTriangle className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={allergyInput}
                                                    onChange={(e) => setAllergyInput(e.target.value)}
                                                    placeholder="Type an allergy and press Add"
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8BAA7C] focus:border-transparent transition-colors"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addAllergy();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addAllergy}
                                                className="px-4 py-3 text-white bg-[#8BAA7C] rounded-lg font-medium hover:bg-[#8BAA7C]/90 focus:outline-none focus:ring-2 focus:ring-[#8BAA7C] focus:ring-offset-2 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        <div className="mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowCommonAllergies(!showCommonAllergies)}
                                                className="text-sm flex items-center text-[#8BAA7C] hover:text-[#8BAA7C]/80 transition-colors"
                                            >
                                                <PlusCircle className="h-4 w-4 mr-1" />
                                                {showCommonAllergies ? 'Hide common allergies' : 'Show common allergies'}
                                            </button>
                                        </div>

                                        {showCommonAllergies && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-3 flex flex-wrap gap-2"
                                            >
                                                {commonAllergies.map((allergy) => (
                                                    <button
                                                        key={allergy}
                                                        type="button"
                                                        onClick={() => addCommonAllergy(allergy)}
                                                        className={`px-3 py-1.5 text-xs rounded-full border ${formData.allergies.includes(allergy)
                                                            ? 'border-[#8BAA7C] bg-[#8BAA7C]/10 text-[#8BAA7C]'
                                                            : 'border-gray-300 bg-white text-gray-700 hover:border-[#8BAA7C] hover:bg-gray-50'
                                                            } transition-colors`}
                                                    >
                                                        {allergy}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}

                                        {formData.allergies.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <div className="w-full text-sm text-gray-500 mb-1">Your allergies:</div>
                                                {formData.allergies.map((allergy, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-3 py-1.5 text-sm bg-[#8BAA7C]/10 text-[#010100] rounded-full border border-[#8BAA7C]/20"
                                                    >
                                                        {allergy}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAllergy(index)}
                                                            className="ml-1.5 text-gray-500 hover:text-red-500 focus:outline-none"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between pt-6">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            <span>Back</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="group px-6 py-3 text-white bg-[#FC842D] rounded-lg font-bold shadow-lg shadow-[#FC842D]/20 hover:shadow-xl hover:shadow-[#FC842D]/30 focus:outline-none focus:ring-2 focus:ring-[#FC842D] focus:ring-offset-2 transition-all duration-300 flex items-center"
                                        >
                                            <span>Continue</span>
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center space-x-2 text-[#8BAA7C] mb-6">
                                        <Target size={20} />
                                        <h3 className="text-xl font-bold text-[#010100]">
                                            Goals & Activity
                                        </h3>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            What is your main goal?
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {goalOptions.map((option) => (
                                                <div
                                                    key={option.value}
                                                    onClick={() => setFormData(prev => ({ ...prev, goalType: option.value as OnboardingData['goalType'] }))}
                                                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${formData.goalType === option.value
                                                        ? 'border-[#8BAA7C] bg-[#8BAA7C]/10 shadow-md'
                                                        : 'border-gray-200 hover:border-[#8BAA7C]/50 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-2xl">{option.icon}</span>
                                                        {formData.goalType === option.value && (
                                                            <CheckCircle className="h-5 w-5 text-[#8BAA7C]" />
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold text-[#010100]">{option.label}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            What's your activity level?
                                        </label>
                                        <div className="space-y-3">
                                            {activityOptions.map((option) => (
                                                <div
                                                    key={option.value}
                                                    onClick={() => setFormData(prev => ({ ...prev, activityLevel: option.value as OnboardingData['activityLevel'] }))}
                                                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${formData.activityLevel === option.value
                                                        ? 'border-[#8BAA7C] bg-[#8BAA7C]/10 shadow-md'
                                                        : 'border-gray-200 hover:border-[#8BAA7C]/50 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center">
                                                        <span className="text-2xl mr-3">{option.icon}</span>
                                                        <div>
                                                            <h4 className="font-bold text-[#010100]">{option.label}</h4>
                                                            <p className="text-sm text-gray-500">{option.description}</p>
                                                        </div>
                                                        <div className="ml-auto">
                                                            {formData.activityLevel === option.value && (
                                                                <CheckCircle className="h-5 w-5 text-[#8BAA7C]" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {tdee !== null && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3, duration: 0.5 }}
                                            className="mt-6 p-5 bg-gradient-to-r from-[#8BAA7C]/10 to-[#ABD483]/10 rounded-xl border border-[#ABD483]/20"
                                        >
                                            <h4 className="text-lg font-bold text-[#010100] mb-2">Your Daily Energy Estimate</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Based on your profile, here's an estimate of your daily calorie needs:
                                            </p>

                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-[#ABD483]/10">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-sm text-gray-500">Maintenance</div>
                                                        <div className="mt-1 text-xl font-bold text-[#8BAA7C]">{tdee} kcal</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-sm text-gray-500">Weight Loss</div>
                                                        <div className="mt-1 text-xl font-bold text-[#FC842D]">{tdee - 500} kcal</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-sm text-gray-500">Weight Gain</div>
                                                        <div className="mt-1 text-xl font-bold text-[#8BAA7C]">{tdee + 500} kcal</div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs text-gray-500 text-center">
                                                    Kcalculate AI will use this data to provide personalized nutrition recommendations
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="flex justify-between pt-6">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            <span>Back</span>
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="group px-6 py-3 text-white bg-[#FC842D] rounded-lg font-bold shadow-lg shadow-[#FC842D]/20 hover:shadow-xl hover:shadow-[#FC842D]/30 focus:outline-none focus:ring-2 focus:ring-[#FC842D] focus:ring-offset-2 transition-all duration-300 flex items-center disabled:opacity-70"
                                        >
                                            {loading ? (
                                                <div className="flex items-center">
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    <span>Completing...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <span>Complete Profile</span>
                                                    <CheckCircle className="ml-2 h-5 w-5" />
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    {/* Debug information (only visible during development) */}
                    {process.env.NODE_ENV !== 'production' && debugInfo && (
                        <div className="p-4 mt-8 overflow-auto text-xs bg-gray-100 rounded whitespace-pre-wrap max-h-40">
                            <strong>Debug Info:</strong>
                            <br />
                            {debugInfo}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}