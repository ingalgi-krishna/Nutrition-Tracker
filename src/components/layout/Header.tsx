// src/components/layout/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    userId?: string;
}

const Header: React.FC<HeaderProps> = ({ userId }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold text-indigo-600" onClick={closeMenu}>
                                NutriTrack
                            </Link>
                        </div>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:ml-6 md:flex md:space-x-8">
                        <Link
                            href="/"
                            className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/')
                                ? 'border-indigo-500 text-gray-900'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                } text-sm font-medium`}
                        >
                            Home
                        </Link>

                        {userId && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/dashboard')
                                        ? 'border-indigo-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } text-sm font-medium`}
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href="/food-log"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/food-log')
                                        ? 'border-indigo-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } text-sm font-medium`}
                                >
                                    Food Log
                                </Link>

                                <Link
                                    href="/recommendations"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/recommendations')
                                        ? 'border-indigo-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } text-sm font-medium`}
                                >
                                    Recommendations
                                </Link>

                                <Link
                                    href="/profile"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/profile')
                                        ? 'border-indigo-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } text-sm font-medium`}
                                >
                                    Profile
                                </Link>
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
                        <Link
                            href="/"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            onClick={closeMenu}
                        >
                            Home
                        </Link>

                        {userId && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href="/food-log"
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/food-log')
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    Food Log
                                </Link>

                                <Link
                                    href="/recommendations"
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/recommendations')
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    Recommendations
                                </Link>

                                <Link
                                    href="/profile"
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/profile')
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    Profile
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;