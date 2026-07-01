import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SavedAddress } from "../../types/address";

interface AddressState {
  addresses: SavedAddress[];
  loading: boolean;
  fetched: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  fetched: false,
  error: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    setAddresses: (state, action: PayloadAction<SavedAddress[]>) => {
      state.addresses = action.payload;
      state.loading = false;
      state.fetched = true;
      state.error = null;
    },
    addAddressSuccess: (state, action: PayloadAction<SavedAddress>) => {
      state.addresses.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateAddressSuccess: (state, action: PayloadAction<SavedAddress>) => {
      const index = state.addresses.findIndex(
        (address) => address.id === action.payload.id
      );
      if (index !== -1) {
        state.addresses[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    deleteAddressSuccess: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(
        (address) => address.id !== action.payload
      );
      state.loading = false;
      state.error = null;
    },
    setDefaultAddressSuccess: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.map((address) => ({
        ...address,
        isDefault: address.id === action.payload,
      }));
      state.loading = false;
      state.error = null;
    },
    setAddressLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAddressError: (state, action: PayloadAction<string | null>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetAddressFetched: (state) => {
      state.fetched = false;
    },
  },
});

export const {
  setAddresses,
  addAddressSuccess,
  updateAddressSuccess,
  deleteAddressSuccess,
  setDefaultAddressSuccess,
  setAddressLoading,
  setAddressError,
  resetAddressFetched,
} = addressSlice.actions;

export default addressSlice.reducer;
