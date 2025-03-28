// src/components/dashboard/StatsCard.tsx
import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        direction: 'up' | 'down' | 'neutral';
    };
}

const StatsCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                        {icon}
                    </div>
                )}
            </div>

            {trend && (
                <div className="mt-4">
                    <div className={`flex items-center text-sm ${trend.direction === 'up' ? 'text-green-600' :
                        trend.direction === 'down' ? 'text-red-600' :
                            'text-gray-600'
                        }`}>
                        {trend.direction === 'up' && (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        )}
                        {trend.direction === 'down' && (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        )}
                        <span className="font-medium">{trend.value}%</span>
                        <span className="ml-1 text-gray-500">{trend.label}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatsCard;