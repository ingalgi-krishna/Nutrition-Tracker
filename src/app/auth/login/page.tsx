// src/app/auth/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/Providers/AuthProvider';
import { Loader2, Mail, Lock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import Lottie component with ssr: false
const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });

export default function LoginPage() {
    const { login, error: authError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({ email: '', password: '' });
    const [touched, setTouched] = useState({ email: false, password: false });
    const [animationData, setAnimationData] = useState<Record<string, any> | null>(null);

    // Load animation data client-side only
    useEffect(() => {
        import('../../../../public/nutrition.json')
            .then(animationModule => {
                return setAnimationData(animationModule.default);
            })
            .catch(err => {
                console.error('Failed to load animation:', err);
            });
    }, []);

    // Validate form fields
    const validateField = (name: string, value: string) => {
        let error = '';

        if (name === 'email') {
            if (!value) {
                error = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(value)) {
                error = 'Email address is invalid';
            }
        } else if (name === 'password') {
            if (!value) {
                error = 'Password is required';
            } else if (value.length < 6) {
                error = 'Password must be at least 6 characters';
            }
        }

        return error;
    };

    const handleBlur = (field: string) => {
        setTouched({ ...touched, [field]: true });

        if (field === 'email') {
            const emailError = validateField('email', email);
            setFormErrors(prev => ({ ...prev, email: emailError }));
        } else if (field === 'password') {
            const passwordError = validateField('password', password);
            setFormErrors(prev => ({ ...prev, password: passwordError }));
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        if (touched.email) {
            const emailError = validateField('email', newEmail);
            setFormErrors(prev => ({ ...prev, email: emailError }));
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (touched.password) {
            const passwordError = validateField('password', newPassword);
            setFormErrors(prev => ({ ...prev, password: passwordError }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields before submission
        const emailError = validateField('email', email);
        const passwordError = validateField('password', password);

        setFormErrors({
            email: emailError,
            password: passwordError
        });

        // Check if there are any errors
        if (emailError || passwordError) {
            setTouched({ email: true, password: true });
            return;
        }

        setLoading(true);
        setError('');

        try {
            const success = await login({ email, password });

            if (!success) {
                setError(authError || 'Failed to login. Please check your credentials and try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#FEFEFF]">
            {/* Lottie animation side */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-[#8BAA7C]/10 to-[#ABD483]/20 flex-col justify-center items-center p-12">
                <div className="max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-[#010100] mb-4">
                            Track your nutrition<br />with intelligence
                        </h1>
                        <p className="text-gray-600">
                            Get personalized meal insights and recommendations powered by AI. Your nutrition journey just got smarter.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="w-full max-w-md"
                    >
                        {animationData && (
                            <Lottie
                                loop
                                animationData={animationData}
                                play
                                style={{ width: '100%', height: 320 }}
                            />
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mt-12"
                    >
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#ABD483]/20">
                            <div className="flex items-start space-x-4">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-[#010100]">Sarah Johnson</p>
                                    <div className="text-sm text-gray-500">
                                        <p className="italic mb-2">
                                            "Kcalculate AI has transformed my relationship with food. The insights are incredibly accurate!"
                                        </p>
                                        <div className="flex items-center">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <svg key={star} className="w-4 h-4 text-[#FC842D]" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Login form side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-md w-full space-y-8"
                >
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-[#010100]">Welcome back</h2>
                        <p className="mt-2 text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/auth/register" className="font-medium text-[#8BAA7C] hover:text-[#ABD483] transition-colors">
                                Sign up now
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
                        >
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <div className={`relative rounded-lg shadow-sm ${formErrors.email && touched.email ? 'border-red-300' : 'border-gray-300'}`}>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className={`h-5 w-5 ${formErrors.email && touched.email ? 'text-red-400' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={handleEmailChange}
                                        onBlur={() => handleBlur('email')}
                                        className={`appearance-none block w-full pl-10 pr-3 py-3 border ${formErrors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                                            } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 ${formErrors.email && touched.email ? 'focus:ring-red-500' : 'focus:ring-[#8BAA7C]'
                                            } focus:border-transparent transition-colors`}
                                        placeholder="you@example.com"
                                    />
                                    {!formErrors.email && email && touched.email && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                                {formErrors.email && touched.email && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className={`relative rounded-lg shadow-sm ${formErrors.password && touched.password ? 'border-red-300' : 'border-gray-300'}`}>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className={`h-5 w-5 ${formErrors.password && touched.password ? 'text-red-400' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={handlePasswordChange}
                                        onBlur={() => handleBlur('password')}
                                        className={`appearance-none block w-full pl-10 pr-3 py-3 border ${formErrors.password && touched.password ? 'border-red-300' : 'border-gray-300'
                                            } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 ${formErrors.password && touched.password ? 'focus:ring-red-500' : 'focus:ring-[#8BAA7C]'
                                            } focus:border-transparent transition-colors`}
                                        placeholder="••••••••"
                                    />
                                    {!formErrors.password && password && touched.password && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                                {formErrors.password && touched.password && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#8BAA7C] focus:ring-[#8BAA7C] border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/auth/reset-password" className="font-medium text-[#8BAA7C] hover:text-[#ABD483] transition-colors">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#FC842D] hover:bg-[#FC842D]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FC842D] disabled:opacity-70 shadow-lg shadow-[#FC842D]/20 transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <span>Sign in</span>
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#FEFEFF] text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.12C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                                    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.08L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                                    <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                                    <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.075C15.0054 18.785 13.6204 19.255 12.0004 19.255C8.8704 19.255 6.21537 17.145 5.2654 14.295L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}