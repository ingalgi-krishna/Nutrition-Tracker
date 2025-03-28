
// src/components/layout/DashboardLayout.tsx
'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Book, BarChart2, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/components/Providers/AuthProvider';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Food Log', href: '/food-log', icon: Book },
        { name: 'Recommendations', href: '/recommendations', icon: Calendar },
        { name: 'Analytics', href: '/analytics', icon: BarChart2 },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile sidebar toggle */}
            <div className="fixed top-0 left-0 z-20 p-4 md:hidden">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-gray-700 bg-white rounded-md shadow-md focus:outline-none"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-10 w-64 transition duration-300 transform bg-white shadow-lg md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:static md:inset-0`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center h-16 px-4 border-b">
                        <h1 className="text-xl font-bold text-indigo-600">NutriTrack</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <nav className="px-2 py-4 space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4 border-t">
                        <button
                            onClick={() => logout()}
                            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                        >
                            <LogOut className="w-5 h-5 mr-3 text-gray-400" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-0 bg-gray-600 bg-opacity-50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
                <header className="h-16 bg-white shadow-sm md:pl-64">
                    <div className="flex items-center justify-end h-full px-4">
                        <div className="flex items-center space-x-4">
                            <div className="text-sm font-medium text-gray-700">
                                {user?.name}
                            </div>
                            <div className="flex items-center justify-center w-8 h-8 text-white bg-indigo-600 rounded-full">
                                {user?.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}