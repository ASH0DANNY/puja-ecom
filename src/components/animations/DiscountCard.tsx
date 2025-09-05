import React from 'react';
import { motion } from 'framer-motion';
import type { Discount } from '../../types/discount';

interface DiscountCardProps {
    discount: Discount;
    isSelected: boolean;
    onClick: () => void;
}

export const DiscountCard: React.FC<DiscountCardProps> = ({
    discount,
    isSelected,
    onClick
}) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
                group relative overflow-hidden 
                border-2 rounded-lg p-6 cursor-pointer 
                transition-all duration-300 ease-in-out
                ${isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 hover:border-primary/50 hover:shadow-md'}
            `}
            onClick={onClick}
        >
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary rounded-full transform rotate-45" />
                <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-primary rounded-full" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <motion.div
                        className="flex items-center space-x-2"
                        initial={false}
                        animate={isSelected ? { x: 0 } : { x: 0 }}
                    >
                        <span className="text-xl font-bold text-primary group-hover:text-primary/90">
                            {discount.code}
                        </span>
                        {isSelected && (
                            <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </motion.svg>
                        )}
                    </motion.div>
                    <motion.div
                        className="text-2xl font-bold text-primary"
                        whileHover={{ scale: 1.1 }}
                    >
                        {discount.discountType === 'percentage'
                            ? `${discount.value}%`
                            : `$${discount.value}`}
                    </motion.div>
                </div>

                {/* Body */}
                <div className="space-y-2">
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                        {discount.description}
                    </p>

                    {/* Requirements */}
                    <div className="space-y-1">
                        {discount.minPurchase && discount.minPurchase > 0 && (
                            <p className="text-sm text-gray-500 group-hover:text-gray-600">
                                Min. purchase: ${discount.minPurchase}
                            </p>
                        )}
                        {discount.maxDiscount && discount.maxDiscount > 0 && (
                            <p className="text-sm text-gray-500 group-hover:text-gray-600">
                                Max. discount: ${discount.maxDiscount}
                            </p>
                        )}
                    </div>

                    {/* Validity */}
                    <div className="flex items-center space-x-2 mt-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {discount.endDate ? (
                                `Valid until: ${discount.endDate.toLocaleDateString()}`
                            ) : (
                                'No expiration'
                            )}
                        </span>
                        {discount.usageLimit && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {discount.usageLimit - discount.currentUsage} uses left
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DiscountCard;
