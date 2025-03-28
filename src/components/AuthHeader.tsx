'use client';

import React from 'react';
import Header from '@/components/layout/Header';

const AuthHeader = () => {
    // No need to get userId and pass it since Header uses useAuth directly
    return <Header />;
};

export default AuthHeader;