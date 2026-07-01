import React from "react";
import type { SavedAddress } from "../types/address";
import { Home, Briefcase, MapPin, Pencil, Trash2 } from "lucide-react";

type AddressLabel = "home" | "office" | "other";

interface Props {
  addresses: SavedAddress[];
  addressesLoading: boolean;
  selectedAddressId: string | null;
  onSelectAddress: (address: SavedAddress) => void;
  onEditAddress: (address: SavedAddress) => void;
  onDeleteAddress: (addressId: string) => void;
  saveAddressChecked: boolean;
  onSaveAddressCheckedChange: (checked: boolean) => void;
  saveAddressLabel: AddressLabel;
  onSaveAddressLabelChange: (label: AddressLabel) => void;
  saveAddressCustomLabel: string;
  onSaveAddressCustomLabelChange: (value: string) => void;
  saveLabelError: string;
  editingAddressId: string | null;
}

const getAddressCardIcon = (label: AddressLabel) => {
  switch (label) {
    case "home":
      return <Home className="w-4 h-4 text-primary" />;
    case "office":
      return <Briefcase className="w-4 h-4 text-primary" />;
    default:
      return <MapPin className="w-4 h-4 text-primary" />;
  }
};

const formatAddressPreview = (address: SavedAddress) => {
  return `${address.street}, ${address.city}, ${address.state} - ${address.postalCode}`;
};

const SavedAddressSelector: React.FC<Props> = ({
  addresses,
  addressesLoading,
  selectedAddressId,
  onSelectAddress,
  onEditAddress,
  onDeleteAddress,
  saveAddressChecked,
  onSaveAddressCheckedChange,
  saveAddressLabel,
  onSaveAddressLabelChange,
  saveAddressCustomLabel,
  onSaveAddressCustomLabelChange,
  saveLabelError,
  editingAddressId,
}) => {
  return (
    <>
      {addresses.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-base font-medium text-gray-900">Saved Addresses</p>
              <p className="text-sm text-gray-500">Select one to autofill your shipping details.</p>
            </div>
            {addressesLoading && <span className="text-sm text-gray-500">Loading...</span>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => onSelectAddress(address)}
                className={`relative text-left p-4 rounded-2xl border transition-colors ${
                  selectedAddressId === address.id ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:border-primary/80"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-full bg-primary/10">{getAddressCardIcon(address.label)}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {address.label === "other" ? address.customLabel || "Other" : address.label.charAt(0).toUpperCase() + address.label.slice(1)}
                      </p>
                      <p className="text-sm text-gray-500">{formatAddressPreview(address)}</p>
                    </div>
                  </div>
                  {address.isDefault && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Default</span>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2 text-gray-500">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditAddress(address);
                    }}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteAddress(address.id);
                    }}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 mt-6">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={saveAddressChecked || Boolean(editingAddressId)}
            onChange={(e) => onSaveAddressCheckedChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">Save this address for faster checkout</p>
            <p className="text-sm text-gray-500">Save the shipping details to reuse them on your next order.</p>
          </div>
        </label>

        {(saveAddressChecked || editingAddressId) && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {(["home", "office", "other"] as const).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onSaveAddressLabelChange(label)}
                  className={`rounded-2xl border px-3 py-2 text-sm font-medium transition-colors ${
                    saveAddressLabel === label ? "border-primary bg-primary/10 text-primary" : "border-gray-200 bg-white text-gray-700 hover:border-primary"
                  }`}
                >
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </button>
              ))}
            </div>

            {saveAddressLabel === "other" && (
              <div>
                <label htmlFor="customAddressLabel" className="text-sm font-medium text-gray-700 mb-2 block">Custom Label</label>
                <input
                  type="text"
                  id="customAddressLabel"
                  value={saveAddressCustomLabel}
                  onChange={(e) => onSaveAddressCustomLabelChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  placeholder="e.g. Parents' home, Grandma's house"
                />
                {saveLabelError && <p className="mt-2 text-sm text-red-600">{saveLabelError}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SavedAddressSelector;
