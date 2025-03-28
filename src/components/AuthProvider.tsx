// src/components/Providers/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, LoginCredentials, RegisterData } from '@/types/auth';
import { UserProfile } from '@/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Check auth status on initial load
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('/api/auth/verify', {
                    credentials: 'include'
                });
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
                credentials: 'include'
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
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success && result.user) {
                setUser(result.user);
                window.location.href = '/auth/onboarding'; // Hard redirect for more reliability
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

    // Logout function
    const logout = async (): Promise<void> => {
        setLoading(true);

        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
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

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};