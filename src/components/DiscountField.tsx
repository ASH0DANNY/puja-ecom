import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useDiscount } from '../context/DiscountContext';

const DiscountField = () => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { applyDiscount, removeDiscount, discountCode, discount } = useCart();
    const { checkFirstTimeDiscount } = useDiscount();

    const handleApplyDiscount = async () => {
        if (!code.trim()) return;

        setLoading(true);
        try {
            const result = await applyDiscount(code.trim().toUpperCase());
            setMessage(result.message);
            if (result.success) {
                setCode('');
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
                <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div>
                            <p className="font-medium text-gray-900">{discountCode}</p>
                            <p className="text-sm text-gray-600">
                                Discount: ${discount.toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={removeDiscount}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter discount code"
                            className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <button
                            onClick={handleApplyDiscount}
                            disabled={loading || !code.trim()}
                            className={`px-4 py-2 rounded-lg font-medium ${loading || !code.trim()
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary text-white hover:bg-primary/90'
                                }`}
                        >
                            {loading ? 'Applying...' : 'Apply'}
                        </button>
                    </div>

                    {message && (
                        <p className={`text-sm ${message.toLowerCase().includes('success')
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                            {message}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DiscountField;
