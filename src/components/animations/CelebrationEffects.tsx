import type { FC } from 'react';

interface CelebrationEffectsProps {
    type: 'success' | 'discount' | 'order';
}

const CelebrationEffects: FC<CelebrationEffectsProps> = ({ type }) => {
    const getColors = () => {
        switch (type) {
            case 'discount':
                return ['bg-green-500', 'bg-primary', 'bg-yellow-500'];
            case 'order':
                return ['bg-green-500', 'bg-blue-500', 'bg-primary'];
            case 'success':
            default:
                return ['bg-yellow-500', 'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
                {colors.map((color, index) => (
                    <div
                        key={index}
                        className={`animate-confetti-${index + 1} absolute w-2 h-2 ${color} rounded-full`}
                    />
                ))}
            </div>
        </div>
    );
};

export default CelebrationEffects;
