import React from "react";
import { User, Phone } from "lucide-react";

interface Props {
    customerForm: { name: string; phone: string };
    formErrors: any;
    formSubmitted: boolean;
    customerTouched: { name: boolean; phone: boolean };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    nameRef: React.RefObject<HTMLInputElement | null>;
    phoneRef: React.RefObject<HTMLInputElement | null>;
}

const CustomerInfoForm: React.FC<Props> = ({
    customerForm,
    formErrors,
    formSubmitted,
    customerTouched,
    onChange,
    onBlur,
    nameRef,
    phoneRef,
}) => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="customerName" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="customerName"
                        name="name"
                        ref={nameRef}
                        value={customerForm.name}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${formErrors.name ? "border-red-500" : "border-gray-300 focus:border-primary"
                            }`}
                        placeholder="Enter your full name"
                    />
                    {(formSubmitted || customerTouched.name) && formErrors.name && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="customerPhone" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="customerPhone"
                        name="phone"
                        ref={phoneRef}
                        value={customerForm.phone}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${formErrors.phone ? "border-red-500" : "border-gray-300 focus:border-primary"
                            }`}
                        placeholder="Enter your phone number"
                    />
                    {(formSubmitted || customerTouched.phone) && formErrors.phone && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerInfoForm;
