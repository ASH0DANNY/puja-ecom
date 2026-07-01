import React from "react";
import { CreditCard, Clock } from "lucide-react";

interface Props {
    paymentMethod: string;
    onlinePaymentEnabled: boolean;
    codEnabled: boolean;
    onChange: (value: string) => void;
}

const PaymentMethodSelector: React.FC<Props> = ({ paymentMethod, onlinePaymentEnabled, codEnabled, onChange }) => {
    return (
        <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-4">
                <CreditCard className="w-5 h-5" />
                Payment Method
            </h2>
            <div className="space-y-3">
                {onlinePaymentEnabled ? (
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="online"
                            checked={paymentMethod === "online"}
                            onChange={(e) => onChange(e.target.value)}
                            className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                        />
                        <span className="ml-3 text-gray-700 font-medium">Pay Online (Cards, UPI, Netbanking, Wallets)</span>
                    </label>
                ) : (
                    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">Online Payment - Coming Soon</span>
                        </div>
                    </div>
                )}

                {codEnabled ? (
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === "cod"}
                            onChange={(e) => onChange(e.target.value)}
                            className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                        />
                        <span className="ml-3 text-gray-700 font-medium">Cash on Delivery</span>
                    </label>
                ) : (
                    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">Cash on Delivery - Coming Soon</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentMethodSelector;
