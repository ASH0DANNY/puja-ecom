import React, { useState } from 'react';
import { useDiscount } from '../context/DiscountContext';
import { motion, AnimatePresence } from 'framer-motion';
import CelebrationEffects from './animations/CelebrationEffects';


interface DiscountSelectorProps {
    subtotal: number;
    onDiscountApplied: (amount: number) => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const DiscountSelector: React.FC<DiscountSelectorProps> = ({
    subtotal,
    onDiscountApplied
}) => {
    const { activeDiscounts, validateDiscount, applyDiscount } = useDiscount();
    const [selectedCode, setSelectedCode] = useState<string>('');
    const [showCelebration, setShowCelebration] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({
        text: '',
        type: 'success'
    });

    const handleDiscountSelect = async (code: string) => {
        setSelectedCode(code);
        const { isValid, discount, message: validationMessage } = await validateDiscount(code, subtotal);

        if (isValid) {
            const { success } = await applyDiscount(code);
            if (success) {
                onDiscountApplied(discount);
                setMessage({ text: 'Discount applied successfully!', type: 'success' });
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 3000);
            }
        } else {
            setMessage({ text: validationMessage, type: 'error' });
        }
    };

    if (activeDiscounts.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Available Offers</h3>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <AnimatePresence>
                    {activeDiscounts.map((discount) => (
                        <motion.div
                            key={discount.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            layout
                            className={`
                                group relative overflow-hidden cursor-pointer
                                border-2 rounded-lg p-6
                                transition-all duration-300 ease-in-out
                                ${selectedCode === discount.code
                                    ? 'border-primary bg-primary/5 shadow-lg'
                                    : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                                }
                            `}
                            onClick={() => handleDiscountSelect(discount.code)}
                        >
                            {/* Background Effects */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                                <motion.div
                                    className="absolute -right-8 -top-8 w-32 h-32 bg-primary rounded-full"
                                    initial={false}
                                    animate={selectedCode === discount.code ? { rotate: 45 } : { rotate: 0 }}
                                    transition={{ duration: 0.4 }}
                                />
                                <motion.div
                                    className="absolute -left-8 -bottom-8 w-24 h-24 bg-primary rounded-full"
                                    initial={false}
                                    animate={selectedCode === discount.code ? { scale: 1.2 } : { scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <motion.span
                                            className="text-xl font-bold text-primary"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            {discount.code}
                                        </motion.span>
                                        {selectedCode === discount.code && (
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
                                    </div>
                                    <motion.div
                                        className="text-2xl font-bold text-primary"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        {discount.discountType === 'percentage'
                                            ? `${discount.value}%`
                                            : `$${discount.value}`
                                        }
                                    </motion.div>
                                </div>

                                <motion.p
                                    className="text-gray-600 mb-4"
                                    initial={false}
                                    animate={selectedCode === discount.code ? {
                                        color: 'rgb(55, 65, 81)',
                                        fontWeight: 500
                                    } : {
                                        color: 'rgb(75, 85, 99)',
                                        fontWeight: 400
                                    }}
                                >
                                    {discount.description}
                                </motion.p>

                                <div className="space-y-2">
                                    {discount.minPurchase && discount.minPurchase > 0 && (
                                        <motion.p
                                            className="text-sm text-gray-500"
                                            initial={false}
                                            animate={selectedCode === discount.code ? {
                                                color: 'rgb(55, 65, 81)'
                                            } : {
                                                color: 'rgb(107, 114, 128)'
                                            }}
                                        >
                                            Min. purchase: ${discount.minPurchase}
                                        </motion.p>
                                    )}
                                    {discount.maxDiscount && discount.maxDiscount > 0 && (
                                        <motion.p
                                            className="text-sm text-gray-500"
                                            initial={false}
                                            animate={selectedCode === discount.code ? {
                                                color: 'rgb(55, 65, 81)'
                                            } : {
                                                color: 'rgb(107, 114, 128)'
                                            }}
                                        >
                                            Max. discount: ${discount.maxDiscount}
                                        </motion.p>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <motion.span
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            {discount.endDate
                                                ? `Valid until: ${discount.endDate.toLocaleDateString()}`
                                                : 'No expiration'
                                            }
                                        </motion.span>
                                        {discount.usageLimit && (
                                            <motion.span
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {discount.usageLimit - discount.currentUsage} uses left
                                            </motion.span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`mt-4 p-3 rounded-lg ${message.type === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            {showCelebration && (
                <CelebrationEffects type="success" />
            )}
        </div>
    );
};

export default DiscountSelector;
