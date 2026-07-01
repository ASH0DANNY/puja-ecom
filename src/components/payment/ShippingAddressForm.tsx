import React from "react";
import { MapPin, Globe } from "lucide-react";
import indianStates from "../../constants/indianStates";

interface Props {
    shippingForm: any;
    formErrors: any;
    formSubmitted: boolean;
    shippingTouched: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
    pinLookupLoading: boolean;
    pinLookupError: string;
    streetRef: React.RefObject<HTMLInputElement | null>;
    cityRef: React.RefObject<HTMLInputElement | null>;
    stateRef: React.RefObject<HTMLSelectElement | null>;
    postalCodeRef: React.RefObject<HTMLInputElement | null>;
}

const ShippingAddressForm: React.FC<Props> = ({
    shippingForm,
    formErrors,
    formSubmitted,
    shippingTouched,
    onChange,
    onBlur,
    pinLookupLoading,
    pinLookupError,
    streetRef,
    cityRef,
    stateRef,
    postalCodeRef,
}) => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="street" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4" />
                        Street Address
                    </label>
                    <input
                        type="text"
                        id="street"
                        name="street"
                        ref={streetRef}
                        value={shippingForm.street}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${formErrors.street ? "border-red-500" : "border-gray-300 focus:border-primary"
                            }`}
                        placeholder="House number and street name"
                    />
                    {(formSubmitted || shippingTouched.street) && formErrors.street && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.street}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="city" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4" />
                            City
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            ref={cityRef}
                            value={shippingForm.city}
                            onChange={onChange}
                            onBlur={onBlur}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${formErrors.city ? "border-red-500" : "border-gray-300 focus:border-primary"
                                }`}
                            placeholder="City"
                        />
                        {(formSubmitted || shippingTouched.city) && formErrors.city && (
                            <p className="mt-2 text-sm text-red-600">{formErrors.city}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="state" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4" />
                            State
                        </label>
                        <select
                            id="state"
                            name="state"
                            ref={stateRef}
                            value={shippingForm.state}
                            onChange={onChange}
                            onBlur={onBlur}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${formErrors.state ? "border-red-500" : "border-gray-300 focus:border-primary"
                                }`}
                        >
                            <option value="">Select state</option>
                            {indianStates.map((state) => (
                                <option key={state} value={state}>
                                    {state}
                                </option>
                            ))}
                        </select>
                        {(formSubmitted || shippingTouched.state) && formErrors.state && (
                            <p className="mt-2 text-sm text-red-600">{formErrors.state}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="postalCode" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4" />
                            Postal Code
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="postalCode"
                                name="postalCode"
                                ref={postalCodeRef}
                                maxLength={6}
                                value={shippingForm.postalCode}
                                onChange={onChange}
                                onBlur={onBlur}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${formErrors.postalCode ? "border-red-500" : "border-gray-300 focus:border-primary"
                                    }`}
                                placeholder="Postal code"
                            />
                            {pinLookupLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">Loading</div>}
                        </div>
                        {(formSubmitted || shippingTouched.postalCode) && formErrors.postalCode && (
                            <p className="mt-2 text-sm text-red-600">{formErrors.postalCode}</p>
                        )}
                        {pinLookupError && <p className="mt-2 text-sm text-orange-600">{pinLookupError}</p>}
                    </div>

                    <div>
                        <label htmlFor="country" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Globe className="w-4 h-4" />
                            Country
                        </label>
                        <input
                            type="text"
                            id="country"
                            name="country"
                            value="India"
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingAddressForm;
