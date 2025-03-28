'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/Providers/AuthProvider'; // Make sure this path is correct

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();

    // If not authenticated, don't render the sidebar
    if (!isAuthenticated) {
        return null;
    }

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <div className="hidden md:block w-64 bg-white shadow-md">
            <div className="h-full flex flex-col py-6">
                <div className="px-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                </div>

                <nav className="flex-1 space-y-1 px-3">
                    <Link
                        href="/dashboard"
                        className={`group flex items-center px-3 py-2 rounded-md ${isActive('/dashboard')
                            ? 'bg-indigo-100 text-indigo-900'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <svg
                            className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive('/dashboard') ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                                }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        Dashboard
                    </Link>

                    <Link
                        href="/food-log"
                        className={`group flex items-center px-3 py-2 rounded-md ${isActive('/food-log')
                            ? 'bg-indigo-100 text-indigo-900'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <svg
                            className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive('/food-log') ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                                }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                        Food Log
                    </Link>

                    <Link
                        href="/recommendations"
                        className={`group flex items-center px-3 py-2 rounded-md ${isActive('/recommendations')
                            ? 'bg-indigo-100 text-indigo-900'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <svg
                            className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive('/recommendations') ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                                }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                        </svg>
                        Recommendations
                    </Link>

                    <Link
                        href="/profile"
                        className={`group flex items-center px-3 py-2 rounded-md ${isActive('/profile')
                            ? 'bg-indigo-100 text-indigo-900'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <svg
                            className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive('/profile') ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                                }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        Profile
                    </Link>
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;