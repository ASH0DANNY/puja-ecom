import type { FC } from 'react';
import CelebrationEffects from './animations/CelebrationEffects';

interface OrderSuccessAnimationProps {
    orderNumber: string;
}

const OrderSuccessAnimation: FC<OrderSuccessAnimationProps> = ({ orderNumber }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <CelebrationEffects type="order" />
            <div className="bg-white p-8 rounded-lg shadow-xl text-center transform transition-all duration-500 animate-fadeIn">
                <div className="text-green-500 mb-4 animate-bounce">
                    <svg
                        className="w-16 h-16 mx-auto transform transition-transform duration-500 hover:scale-110"
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
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-scale">Order Successful!</h2>
                <p className="text-gray-600 mb-4 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                    Your order number is: <span className="font-semibold">{orderNumber}</span>
                </p>
                <p className="text-sm text-gray-500 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                    You will receive an email confirmation shortly.
                </p>
            </div>
        </div>
    );
};

export default OrderSuccessAnimation;
