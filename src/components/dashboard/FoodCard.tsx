// src/components/food/FoodCard.tsx
import React from 'react';
import { Trash2, Clock, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

interface FoodCardProps {
    foodName: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    imageUrl?: string;
    timestamp: string;
    onDelete?: () => void;
}

const FoodCard: React.FC<FoodCardProps> = ({
    foodName,
    calories,
    proteins,
    carbs,
    fats,
    imageUrl,
    timestamp,
    onDelete,
}) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#ABD483]/20 h-full"
        >
            {imageUrl && (
                <div className="w-full h-40 bg-gray-100 relative">
                    <img
                        src={imageUrl}
                        alt={foodName}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-[#FC842D] text-white rounded-full px-2 py-1 text-xs font-bold">
                        {calories} cal
                    </div>
                </div>
            )}

            <div className="p-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-[#010100]">{foodName}</h3>
                    {!imageUrl && (
                        <span className="bg-[#FC842D]/10 text-[#FC842D] text-xs px-2.5 py-1 rounded-full font-bold">
                            {calories} cal
                        </span>
                    )}
                </div>

                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                            <span className="text-sm font-bold text-[#8BAA7C]">{proteins}g</span>
                            <p className="text-xs text-gray-500">Protein</p>
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-bold text-[#ABD483]">{carbs}g</span>
                            <p className="text-xs text-gray-500">Carbs</p>
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-bold text-[#8BAA7C]/70">{fats}g</span>
                            <p className="text-xs text-gray-500">Fat</p>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(timestamp).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>

                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default FoodCard;