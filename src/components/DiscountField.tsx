import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const DiscountField = () => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const { applyDiscount, removeDiscount, discountCode, discount } = useCart();

    const handleApplyDiscount = async () => {
        if (!code.trim()) return;

        setLoading(true);
        try {
            const result = await applyDiscount(code.trim().toUpperCase());
            setMessage(result.message);
            if (result.success) {
                setCode('');
                setShowAnimation(true);
                setTimeout(() => setShowAnimation(false), 3000);
            }
        } catch (error) {
            setMessage('Error applying discount code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg mb-4">Apply Discount Code</h3>

            {discountCode ? (
                <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                        <div>
                            <p className="font-medium text-gray-900">{discountCode}</p>
                            <p className="text-sm text-gray-600">
                                Discount: ${discount.toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={removeDiscount}
                            className="text-red-600 hover:text-red-800 text-sm font-medium transform transition-all duration-300 hover:scale-110"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter discount code"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            disabled={loading}
                        />
                        <button
                            onClick={handleApplyDiscount}
                            disabled={loading || !code.trim()}
                            className={`px-4 py-2 text-white rounded-md transition-all duration-300 ${loading || !code.trim()
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary/90 hover:shadow-md'
                                }`}
                        >
                            {loading ? 'Applying...' : 'Apply'}
                        </button>
                    </div>
                    {message && (
                        <p className={`text-sm ${message.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {message}
                        </p>
                    )}
                </div>
            )}

            {/* Success Animation */}
            <AnimatePresence>
                {showAnimation && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
                    >
                        <div className="flex items-center space-x-2">
                            <svg
                                className="w-6 h-6"
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
                            <span>Discount applied successfully!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DiscountField;
