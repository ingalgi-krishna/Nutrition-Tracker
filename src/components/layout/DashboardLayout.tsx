// src/components/layout/DashboardLayout.tsx
'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Utensils,
    Lightbulb,
    BarChart,
    User,
    LogOut,
    Menu,
    X,
    Calendar,
    Settings,
    Bell,
    Droplet,
    Wheat
} from 'lucide-react';
import { useAuth } from '@/components/Providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Water Tracker', href: '/water-tracker', icon: Droplet },
        { name: 'Food Log', href: '/food-log', icon: Wheat },
        { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
        { name: 'Analytics', href: '/analytics', icon: BarChart },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour < 12) {
            return "Good morning";
        } else if (hour < 18) {
            return "Good afternoon";
        } else {
            return "Good evening";
        }
    };

    return (
        <div className="flex min-h-screen bg-[#FEFEFF] font-DM_Sans">
            {/* Mobile sidebar toggle */}
            <div className="fixed top-0 left-0 z-30 p-4 md:hidden">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-[#8BAA7C] bg-white rounded-lg shadow-sm focus:outline-none border border-[#ABD483]/20"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar for desktop and mobile */}
            <div
                className={`fixed inset-y-0 left-0 z-20 w-72 transition-transform duration-300 transform bg-white border-r border-[#ABD483]/20 shadow-sm md:shadow-none md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:static md:inset-0 md:w-64`}
            >
                <div className="flex flex-col h-full">
                    {/* Brand/Logo section */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-[#ABD483]/20">
                        <h1 className="text-xl font-bold text-[#8BAA7C]">NutriTrack</h1>
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* User Profile Section */}
                    <div className="p-6 border-b border-[#ABD483]/20">
                        <div className="flex items-center mb-4">
                            {user ? (
                                <img
                                    alt={user.name || 'User'}
                                    className="w-10 h-10 rounded-full border-2 border-[#8BAA7C]"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-[#ABD483]/20 flex items-center justify-center">
                                    <User className="h-5 w-5 text-[#8BAA7C]" />
                                </div>
                            )}
                            <div className="ml-3">
                                <p className="text-xs text-gray-500">{getGreeting()}</p>
                                <h3 className="font-bold text-[#010100] truncate max-w-[160px]">
                                    {user?.name || 'User'}
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 py-2 px-3 bg-[#ABD483]/10 rounded-lg">
                            <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#8BAA7C]" />
                                <span>Today's Entries</span>
                            </div>
                            <span className="font-semibold text-[#8BAA7C]">3</span>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="flex-1 overflow-y-auto py-6 px-3">
                        <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Menu
                        </h3>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center px-4 py-2.5 rounded-lg transition-all ${isActive
                                            ? 'bg-[#8BAA7C] text-white shadow-sm'
                                            : 'text-gray-700 hover:bg-[#ABD483]/10'
                                            }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className={`mr-3 ${isActive ? 'text-white' : 'text-[#8BAA7C]'}`}>
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="font-medium">{item.name}</span>

                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="w-1.5 h-1.5 rounded-full bg-white ml-auto"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Sign Out Section */}
                    <div className="p-4 border-t border-[#ABD483]/20">
                        <div className="space-y-1">
                            <Link
                                href="/settings"
                                className="group flex items-center px-4 py-2.5 rounded-lg text-gray-700 hover:bg-[#ABD483]/10 transition-all"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Settings className="mr-3 h-5 w-5 text-gray-500" />
                                <span className="font-medium">Settings</span>
                            </Link>

                            <button
                                onClick={() => logout()}
                                className="w-full flex items-center px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 bg-white shadow-sm sticky top-0 z-10 border-b border-[#ABD483]/10">
                    <div className="h-full px-4 md:px-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <h2 className="text-xl font-bold text-[#010100] ml-8 md:ml-0">
                                {navItems.find(item => item.href === pathname)?.name || 'Dashboard'}
                            </h2>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="p-1.5 text-gray-500 hover:text-[#8BAA7C] rounded-full hover:bg-[#ABD483]/10 transition-colors">
                                <Bell className="h-5 w-5" />
                            </button>

                            <Link
                                href="/profile"
                                className="flex items-center text-sm"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <div className="hidden md:block font-medium text-gray-700 mr-2">
                                    {user?.name?.split(' ')[0]}
                                </div>
                                <div className="flex items-center justify-center w-8 h-8 text-white bg-[#8BAA7C] rounded-full">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}