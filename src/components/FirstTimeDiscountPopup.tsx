import { useState, useEffect } from 'react';
import { useDiscount } from '../context/DiscountContext';
import { useAuth } from '../context/AuthContext';

const FirstTimeDiscountPopup = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const { checkFirstTimeDiscount } = useDiscount();
    const { user } = useAuth();

    useEffect(() => {
        const checkDiscount = async () => {
            if (user) {
                const { hasDiscount, discount } = await checkFirstTimeDiscount();
                if (hasDiscount && discount) {
                    setDiscountCode(discount.code);
                    setShowPopup(true);
                }
            }
        };

        checkDiscount();
    }, [user]);

    if (!showPopup) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
                <button
                    onClick={() => setShowPopup(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
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
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4">
                        <svg
                            className="w-full h-full text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v13m0-13V6a4 4 0 00-4-4H5.45a4 4 0 00-3.841 2.855l-1.333 4A4 4 0 004.045 14h1.93m0-13h1.31a4 4 0 013.841 2.855l1.333 4A4 4 0 018.955 14h-1.93m0 13h1.31a4 4 0 003.841-2.855l1.333-4A4 4 0 0115.955 14h1.93m0-13H20a4 4 0 014 4v8a4 4 0 01-4 4h-1.93"
                            />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome Gift! 🎉
                    </h2>

                    <p className="text-gray-600 mb-6">
                        As a new customer, we're giving you a special discount on your first purchase!
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-2">Your discount code:</p>
                        <div className="flex items-center justify-center space-x-2">
                            <code className="bg-gray-100 px-4 py-2 rounded-lg text-lg font-mono font-semibold text-primary">
                                {discountCode}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(discountCode);
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                title="Copy to clipboard"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowPopup(false)}
                        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FirstTimeDiscountPopup;
