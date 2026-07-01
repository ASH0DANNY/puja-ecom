import React from "react";
import { ShoppingBag } from "lucide-react";

interface Props {
    items: any[];
    total: number;
    discountCode?: string | null;
}

const OrderSummaryCard: React.FC<Props> = ({ items, total, discountCode }) => {

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 h-fit">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-6">
                <ShoppingBag className="w-5 h-5" />
                Order Summary
            </h2>
            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={`${item.id}-${item.selectedSize}-${JSON.stringify(item.customDimensions)}`}
                        className="pb-4 border-b last:border-b-0"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <span className="font-medium text-gray-900">{item.name}</span>
                                <span className="text-gray-500 ml-2">× {item.quantity}</span>
                            </div>
                            <span className="font-semibold text-gray-900">
                                {(item.selectedSize && item.sizesWithPrices && item.sizesWithPrices.length > 0
                                    ? item.sizesWithPrices.find((s: any) => s.size === item.selectedSize)?.price || item.price
                                    : item.discountPrice || item.price
                                ).toFixed(2)}
                            </span>
                        </div>
                        {item.selectedSize && <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>}
                        {item.selectedColor && <p className="text-sm text-gray-600">Color: {item.selectedColor}</p>}
                        {item.customDimensions && (
                            <p className="text-sm text-gray-600">
                                Dimensions: {item.customDimensions.width} × {item.customDimensions.height}
                                {item.customDimensions.depth ? ` × ${item.customDimensions.depth}` : ""} cm
                            </p>
                        )}
                    </div>
                ))}
                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-900">Total Amount</span>
                        <span className="font-bold text-primary text-xl">{total.toFixed(2)}</span>
                    </div>
                    {discountCode && <p className="text-sm text-green-600 mt-2">Discount code "{discountCode}" applied</p>}
                </div>
            </div>
        </div>
    );
};

export default OrderSummaryCard;
