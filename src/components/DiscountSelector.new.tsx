import React, { useState } from 'react';
import { useDiscount } from '../context/DiscountContext';
import { motion } from 'framer-motion';
import CelebrationEffects from './animations/CelebrationEffects';

interface DiscountSelectorProps {
    subtotal: number;
    onDiscountApplied: (amount: number) => void;
}

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    subtotal: number;
    onDiscountApplied: (amount: number) => void;
}

const DiscountModal: React.FC<DiscountModalProps> = ({
    isOpen,
    onClose,
    subtotal,
    onDiscountApplied
}) => {
    const { activeDiscounts, validateDiscount, applyDiscount, loading } = useDiscount();
    const [selectedCode, setSelectedCode] = useState<string>('');
    const [showCelebration, setShowCelebration] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({
        text: '',
        type: 'success'
    });

    const handleDiscountSelect = async (code: string) => {
        if (code === selectedCode) {
            return;
        }

        setSelectedCode(code);
        const { isValid, discount, message: validationMessage } = await validateDiscount(code, subtotal);

        if (isValid) {
            const { success } = await applyDiscount(code);
            if (success) {
                onDiscountApplied(discount);
                setMessage({ text: 'Discount applied successfully!', type: 'success' });
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 3000);
                setTimeout(() => onClose(), 1000); // Close modal after successful application
            } else {
                setMessage({ text: 'Failed to apply discount', type: 'error' });
            }
        } else {
            setMessage({ text: validationMessage, type: 'error' });
            setSelectedCode('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Select an Offer</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : activeDiscounts.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                No discounts available at the moment
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-4">
                                {activeDiscounts.map((discount) => (
                                    <motion.div
                                        key={discount.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`
                                            cursor-pointer rounded-lg p-4 transition-all duration-200
                                            ${selectedCode === discount.code
                                                ? 'bg-primary/5 border-2 border-primary shadow-lg'
                                                : 'border-2 border-gray-200 hover:border-primary/50 hover:shadow-md'
                                            }
                                        `}
                                        onClick={() => handleDiscountSelect(discount.code)}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-lg font-bold text-primary">{discount.code}</span>
                                            <span className="text-lg font-bold">
                                                {discount.discountType === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                                            </span>
                                        </div>
                                        <p className="text-gray-600">{discount.description}</p>
                                        {discount.minPurchase > 0 && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Min. purchase: ${discount.minPurchase}
                                            </p>
                                        )}
                                        {discount.maxDiscount > 0 && (
                                            <p className="text-sm text-gray-500">
                                                Max discount: ${discount.maxDiscount}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`mt-4 p-3 rounded-lg ${
                                    message.type === 'success'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
            {showCelebration && <CelebrationEffects type="success" />}
        </div>
    );
};

const DiscountSelector: React.FC<DiscountSelectorProps> = ({
    subtotal,
    onDiscountApplied
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { activeDiscounts } = useDiscount();
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Available Offers</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                >
                    <span>View Offers</span>
                    {activeDiscounts.length > 0 && (
                        <span className="bg-white text-primary rounded-full h-6 w-6 flex items-center justify-center text-sm ml-2">
                            {activeDiscounts.length}
                        </span>
                    )}
                </button>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`mt-4 p-3 rounded-lg ${
                        message.type === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {message.text}
                </motion.div>
            )}

            <DiscountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                subtotal={subtotal}
                onDiscountApplied={(amount) => {
                    onDiscountApplied(amount);
                    setMessage({ text: `Discount of $${amount.toFixed(2)} applied successfully!`, type: 'success' });
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
};

export default DiscountSelector;
