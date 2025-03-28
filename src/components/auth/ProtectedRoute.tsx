// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export default function ProtectedRoute({
  children,
  requireOnboarding = true
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (requireOnboarding && !user.onboardingCompleted) {
        router.push('/auth/onboarding');
      }
    }
  }, [user, loading, router, requireOnboarding]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>
          <p className="mt-2 text-gray-600">Please wait while we verify your account.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (requireOnboarding && !user.onboardingCompleted) {
    return null; // Will redirect to onboarding in useEffect
  }

  return <>{children}</>;
}