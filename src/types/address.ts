export type AddressLabel = "home" | "office" | "other";

export interface SavedAddressPayload {
  label: AddressLabel;
  customLabel?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: "India";
  isDefault: boolean;
}

export interface SavedAddress extends SavedAddressPayload {
  id: string;
  createdAt: any;
  updatedAt: any;
}
