import React from 'react';
import { motion } from 'framer-motion';
import type { Discount } from '../types/discount';

interface DiscountCardProps {
    discount: Discount;
    isSelected: boolean;
    onSelect: (code: string) => void;
}

const DiscountCard: React.FC<DiscountCardProps> = ({ discount, isSelected, onSelect }) => {
    const cardVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.02 },
        selected: { scale: 1.02, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate={isSelected ? "selected" : "initial"}
            whileHover="hover"
            className={`
                cursor-pointer p-4 rounded-lg transition-colors duration-200
                ${isSelected
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-white border border-gray-200 hover:border-primary/50'}
            `}
            onClick={() => onSelect(discount.code)}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="text-lg font-semibold text-gray-900">{discount.code}</h4>
                    <p className="text-sm text-gray-600">{discount.description}</p>
                </div>
                <div className="text-right">
                    <span className="text-xl font-bold text-primary">
                        {discount.discountType === 'percentage'
                            ? `${discount.value}%`
                            : `$${discount.value}`}
                    </span>
                </div>
            </div>

            <div className="space-y-1 text-sm text-gray-500">
                {discount.minPurchase && discount.minPurchase > 0 && (
                    <p>Min. Purchase: ${discount.minPurchase.toFixed(2)}</p>
                )}
                {discount.maxDiscount && discount.maxDiscount > 0 && (
                    <p>Max. Discount: ${discount.maxDiscount.toFixed(2)}</p>
                )}
                {discount.endDate && (
                    <p>Valid until: {new Date(discount.endDate).toLocaleDateString()}</p>
                )}
            </div>

            {isSelected && (
                <div className="mt-3 flex items-center text-primary text-sm">
                    <svg
                        className="w-5 h-5 mr-1"
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
                    </svg>
                    Applied
                </div>
            )}
        </motion.div>
    );
};

export default DiscountCard;
