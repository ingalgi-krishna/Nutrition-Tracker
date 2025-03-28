// src/components/Providers/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, LoginCredentials, RegisterData } from '@/types/auth';
import { UserProfile } from '@/types/user';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Check if user is logged in on initial load
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('/api/auth/verify');
                const data = await response.json();

                if (data.success && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Login function
    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);

                // Redirect based on onboarding status
                if (!data.user.onboardingCompleted) {
                    router.push('/auth/onboarding');
                } else {
                    router.push('/dashboard');
                }
                return true;
            } else {
                setError(data.message || 'Login failed');
                return false;
            }
        } catch (err) {
            setError('An error occurred during login');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (data: RegisterData): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success && result.user) {
                setUser(result.user);
                router.push('/auth/onboarding');
                return true;
            } else {
                setError(result.message || 'Registration failed');
                return false;
            }
        } catch (err) {
            setError('An error occurred during registration');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // New function to update user after onboarding
    const updateUserAfterOnboarding = (updatedUserData: UserProfile) => {
        setUser(updatedUserData);
    };

    // Logout function
    const logout = async (): Promise<void> => {
        setLoading(true);

        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            setUser(null);
            router.push('/auth/login');
        } catch (err) {
            setError('Logout failed');
        } finally {
            setLoading(false);
        }
    };

    const contextValue: AuthContextType = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};