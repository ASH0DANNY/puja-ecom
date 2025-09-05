import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartAnimationProps {
    isVisible: boolean;
}

const CartAnimation: React.FC<CartAnimationProps> = ({ isVisible }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
                >
                    Item added to cart!
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CartAnimation;
