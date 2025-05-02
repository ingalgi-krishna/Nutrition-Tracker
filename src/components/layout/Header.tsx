// src/components/layout/Header.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers/AuthProvider';
import { User, LogOut, ChevronDown, Menu, X, BarChart2, Apple, List, Home, Heart, Droplet, Wheat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
        setIsUserMenuOpen(false);
        closeMenu();
    };

    const isActive = (path: string) => {
        return pathname === path;
    };

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    // Navbar item styles
    const navItemClass = (path: string) => `
        relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive(path)
            ? 'text-[#010100] font-bold'
            : 'text-gray-600 hover:text-[#8BAA7C]'}
    `;

    // Active indicator for nav items
    const ActiveIndicator = () => (
        <motion.div
            layoutId="activeIndicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FC842D] rounded-full mx-1"
            transition={{ type: "spring", duration: 0.3 }}
        />
    );

    return (
        <header className="bg-[#FEFEFF] shadow-sm border-b border-[#ABD483]/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link
                            href={user ? "/dashboard" : "/"}
                            className="flex-shrink-0 flex items-center space-x-2 group"
                            onClick={closeMenu}
                        >
                            {/* Replace the Heart icon with your logo */}
                            <img src="/logo.png" alt="Kcalculate AI Logo" className="h-10 w-10" />

                            <span className="text-xl font-extrabold group-hover:opacity-90 transition-opacity">
                                <span className="text-[#8BAA7C]">Kcalculate</span>
                                <span className="text-[#FC842D]">AI</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex md:items-center md:space-x-2">
                        {!user ? (
                            // Unauthenticated menu
                            <>
                                <Link href="/auth/login" className={navItemClass('/auth/login')}>
                                    Login
                                    {isActive('/auth/login') && <ActiveIndicator />}
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="ml-4 px-5 py-2 rounded-lg text-white bg-[#FC842D] hover:bg-[#FC842D]/90 shadow-md hover:shadow-lg transition-all duration-200 font-bold text-sm"
                                >
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            // Authenticated menu
                            <>
                                <Link href="/dashboard" className={navItemClass('/dashboard')}>
                                    <div className="flex items-center space-x-1.5">
                                        <Home className="w-4 h-4" />
                                        <span>Dashboard</span>
                                    </div>
                                    {isActive('/dashboard') && <ActiveIndicator />}
                                </Link>

                                <Link href="/water-tracker" className={navItemClass('/food-log')}>
                                    <div className="flex items-center space-x-1.5">
                                        <Droplet className="w-4 h-4" />
                                        <span>Water Intake</span>
                                    </div>
                                    {isActive('/water-tracker') && <ActiveIndicator />}
                                </Link>


                                <Link href="/food-log" className={navItemClass('/food-log')}>
                                    <div className="flex items-center space-x-1.5">
                                        <Wheat className="w-4 h-4" />
                                        <span>Food Log</span>
                                    </div>
                                    {isActive('/food-log') && <ActiveIndicator />}
                                </Link>

                                <Link href="/recommendations" className={navItemClass('/recommendations')}>
                                    <div className="flex items-center space-x-1.5">
                                        <Apple className="w-4 h-4" />
                                        <span>Recommendations</span>
                                    </div>
                                    {isActive('/recommendations') && <ActiveIndicator />}
                                </Link>

                                {/* User dropdown menu */}
                                <div className="relative ml-4" ref={userMenuRef}>
                                    <button
                                        onClick={toggleUserMenu}
                                        className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#010100] hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#8BAA7C] to-[#ABD483] text-white">
                                            {user.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />}
                                        </div>
                                        <span className="font-medium text-sm">{user.name?.split(' ')[0]}</span>
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    </button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-56 py-1 bg-white rounded-xl shadow-lg z-10 border border-[#ABD483]/20 overflow-hidden"
                                            >
                                                <Link
                                                    href="/profile"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#ABD483]/10 transition-colors duration-150"
                                                >
                                                    <User className="mr-3 h-4 w-4 text-[#8BAA7C]" />
                                                    <div>
                                                        <div className="font-medium">Profile Settings</div>
                                                        <div className="text-xs text-gray-500">Manage your account</div>
                                                    </div>
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#ABD483]/10 transition-colors duration-150"
                                                >
                                                    <LogOut className="mr-3 h-4 w-4 text-[#8BAA7C]" />
                                                    <div>
                                                        <div className="font-medium">Sign Out</div>
                                                        <div className="text-xs text-gray-500">End your session</div>
                                                    </div>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-[#8BAA7C] hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                            onClick={toggleMenu}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        ref={mobileMenuRef}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden overflow-hidden bg-white border-b border-[#ABD483]/20"
                        id="mobile-menu"
                    >
                        <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
                            {!user ? (
                                // Unauthenticated mobile menu
                                <>
                                    <Link
                                        href="/auth/login"
                                        className={`block px-3 py-2 rounded-lg text-base font-medium ${isActive('/auth/login')
                                            ? 'text-[#010100] bg-[#ABD483]/10 font-bold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#8BAA7C]'
                                            } transition-colors duration-200`}
                                        onClick={closeMenu}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        className={`block px-3 py-2 rounded-lg text-base font-medium ${isActive('/auth/register')
                                            ? 'text-[#010100] bg-[#ABD483]/10 font-bold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#8BAA7C]'
                                            } transition-colors duration-200`}
                                        onClick={closeMenu}
                                    >
                                        Register
                                    </Link>
                                </>
                            ) : (
                                // Authenticated mobile menu
                                <>
                                    <div className="py-3 px-3 mb-2 border-b border-[#ABD483]/10">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-[#8BAA7C] to-[#ABD483] text-white text-lg font-bold">
                                                {user.name ? user.name[0].toUpperCase() : <User className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#010100]">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href="/dashboard"
                                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${isActive('/dashboard')
                                            ? 'text-[#010100] bg-[#ABD483]/10 font-bold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#8BAA7C]'
                                            } transition-colors duration-200`}
                                        onClick={closeMenu}
                                    >
                                        <Home className="h-5 w-5" />
                                        <span>Dashboard</span>
                                    </Link>

                                    <Link
                                        href="/food-log"
                                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${isActive('/food-log')
                                            ? 'text-[#010100] bg-[#ABD483]/10 font-bold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#8BAA7C]'
                                            } transition-colors duration-200`}
                                        onClick={closeMenu}
                                    >
                                        <List className="h-5 w-5" />
                                        <span>Food Log</span>
                                    </Link>

                                    <Link
                                        href="/water-tracker"
                                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${isActive('/food-log')
                                            ? 'text-[#010100] bg-[#ABD483]/10 font-bold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#8BAA7C]'
                                            } transition-colors duration-200`}
                                        onClick={closeMenu}
                                    >
                                        <List className="h-5 w-5" />
                                        <span>Water Intake</span>
                                    </Link>

                                    <Link
                                        href="/recommendations"
                                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${isActive('/recommendations')
                                            ? 'text-[#010100] bg-[#ABD483]/10 font-bold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#8BAA7C]'
                                            } transition-colors duration-200`}
                                        onClick={closeMenu}
                                    >
                                        <Apple className="h-5 w-5" />
                                        <span>Recommendations</span>
                                    </Link>

                                    <Link
                                        href="/profile"
                                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${isActive('/profile')
                                            ? 'text-[#010100] bg-[#ABD483]/10 font-bold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#8BAA7C]'
                                            } transition-colors duration-200`}
                                        onClick={closeMenu}
                                    >
                                        <User className="h-5 w-5" />
                                        <span>Profile</span>
                                    </Link>

                                    <div className="py-1 mt-2 border-t border-[#ABD483]/10">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-[#FC842D] transition-colors duration-200"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;