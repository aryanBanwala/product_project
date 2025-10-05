'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '../../services/AuthService';

const Header = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
    }, []);

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        router.push('/login');
    };

    return (
        <nav className="flex justify-between items-center px-8 py-4 bg-gray-800 text-white shadow-md">
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300">
                ProductApp
            </Link>

            <div>
                {isAuthenticated ? (
                    <div className="flex items-center">
                        <Link href="/products" className="text-white hover:text-gray-300 mr-4">
                            Products
                        </Link>
                        <span className="mr-6 text-gray-300">
                            Welcome, User!
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                        >
                            Logout 🚪
                        </button>
                    </div>
                ) : (
                    <div>
                        <Link href="/login" className="text-white hover:text-gray-300 mr-4">
                            Login
                        </Link>
                        <Link href="/signup" className="text-white hover:text-gray-300">
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Header;
