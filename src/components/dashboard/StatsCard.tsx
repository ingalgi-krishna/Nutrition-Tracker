// src/components/dashboard/StatsCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

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
    accentColor?: string;
    className?: string;
}

const StatsCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    accentColor = "#8BAA7C",
    className = ""
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-xl shadow-sm p-5 border border-[#ABD483]/20 font-DM_Sans ${className}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-1 text-2xl font-bold text-[#010100]">{value}</p>
                    {subtitle && (
                        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className="p-3 rounded-full bg-opacity-20" style={{ backgroundColor: `${accentColor}30` }}>
                        <div style={{ color: accentColor }}>
                            {icon}
                        </div>
                    </div>
                )}
            </div>

            {trend && (
                <div className="mt-4 flex items-center">
                    <div className={`flex items-center justify-center text-sm px-2 py-0.5 rounded-full ${trend.direction === 'up' ? 'text-green-600 bg-green-50' :
                        trend.direction === 'down' ? 'text-red-600 bg-red-50' :
                            'text-gray-600 bg-gray-50'
                        }`}>
                        {trend.direction === 'up' && <ArrowUp className="w-3 h-3 mr-0.5" />}
                        {trend.direction === 'down' && <ArrowDown className="w-3 h-3 mr-0.5" />}
                        <span className="font-medium text-xs">{trend.value}%</span>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">{trend.label}</span>
                </div>
            )}
        </motion.div>
    );
};

export default StatsCard;