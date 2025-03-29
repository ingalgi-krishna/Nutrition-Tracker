// src/components/layout/Header.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers/AuthProvider';
import { User, LogOut, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const userMenuRef = useRef<HTMLDivElement>(null);

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

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold text-indigo-600" onClick={closeMenu}>
                                NutriTrack
                            </Link>
                        </div>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {!user ? (
                            // Unauthenticated menu
                            <>
                                <Link
                                    href="/auth/login"
                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/auth/login')
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/auth/register')
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            // Authenticated menu
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href="/food-log"
                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/food-log')
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    Food Log
                                </Link>

                                <Link
                                    href="/recommendations"
                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/recommendations')
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    Recommendations
                                </Link>

                                {/* User dropdown menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={toggleUserMenu}
                                        className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile')
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            } focus:outline-none`}
                                    >
                                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-sm">{user.name?.split(' ')[0]}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <User className="mr-2 h-4 w-4" />
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                            onClick={toggleMenu}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="pt-2 pb-3 space-y-1">
                        {!user ? (
                            // Unauthenticated mobile menu
                            <>
                                <Link
                                    href="/auth/login"
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/auth/login')
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/auth/register')
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            // Authenticated mobile menu
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href="/food-log"
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/food-log')
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    Food Log
                                </Link>

                                <Link
                                    href="/recommendations"
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/recommendations')
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    Recommendations
                                </Link>

                                <Link
                                    href="/profile"
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/profile')
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    Profile
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;