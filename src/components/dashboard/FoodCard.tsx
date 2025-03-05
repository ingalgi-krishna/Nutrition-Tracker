// src/components/food/FoodCard.tsx
import React from 'react';

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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {imageUrl && (
                <div className="w-full h-32 bg-gray-200">
                    <img
                        src={imageUrl}
                        alt={foodName}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="p-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{foodName}</h3>
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
                        {calories} cal
                    </span>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="text-center">
                        <span className="text-sm font-medium text-indigo-600">{proteins}g</span>
                        <p className="text-xs text-gray-500">Protein</p>
                    </div>
                    <div className="text-center">
                        <span className="text-sm font-medium text-green-600">{carbs}g</span>
                        <p className="text-xs text-gray-500">Carbs</p>
                    </div>
                    <div className="text-center">
                        <span className="text-sm font-medium text-amber-600">{fats}g</span>
                        <p className="text-xs text-gray-500">Fat</p>
                    </div>
                </div>

                <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                        {new Date(timestamp).toLocaleString()}
                    </span>

                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="text-xs text-red-600 hover:text-red-800"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodCard;