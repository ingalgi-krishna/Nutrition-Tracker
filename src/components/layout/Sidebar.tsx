'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/Providers/AuthProvider';
import {
    LayoutDashboard,
    Utensils,
    Lightbulb,
    User,
    BarChart,
    Calendar,
    LogOut,
    Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth();

    // If not authenticated, don't render the sidebar
    if (!isAuthenticated) {
        return null;
    }

    const isActive = (path: string) => {
        return pathname === path;
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

    const navItems = [
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="h-5 w-5" />
        },
        {
            href: '/food-log',
            label: 'Food Log',
            icon: <Utensils className="h-5 w-5" />
        },
        {
            href: '/recommendations',
            label: 'Recommendations',
            icon: <Lightbulb className="h-5 w-5" />
        },
        {
            href: '/analytics',
            label: 'Analytics',
            icon: <BarChart className="h-5 w-5" />
        },
        {
            href: '/profile',
            label: 'Profile',
            icon: <User className="h-5 w-5" />
        }
    ];

    return (
        <div className="hidden md:flex flex-col w-64 bg-white border-r border-[#ABD483]/20 h-screen sticky top-0">
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

            {/* Navigation Menu */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Menu
                </h3>

                <div className="mt-3 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center px-4 py-2.5 rounded-lg transition-all ${isActive(item.href)
                                ? 'bg-[#8BAA7C] text-white shadow-sm'
                                : 'text-gray-700 hover:bg-[#ABD483]/10'
                                }`}
                        >
                            <span className={`mr-3 ${isActive(item.href) ? 'text-white' : 'text-[#8BAA7C]'}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.label}</span>

                            {isActive(item.href) && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="w-1.5 h-1.5 rounded-full bg-white ml-auto"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#ABD483]/20">
                <div className="space-y-1">
                    <Link
                        href="/settings"
                        className="group flex items-center px-4 py-2.5 rounded-lg text-gray-700 hover:bg-[#ABD483]/10 transition-all"
                    >
                        <Settings className="mr-3 h-5 w-5 text-gray-500" />
                        <span className="font-medium">Settings</span>
                    </Link>

                    <button
                        onClick={() => logout && logout()}
                        className="w-full flex items-center px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;