import { api } from './api';

export interface UserAddress {
  id: string;
  label: string;
  houseNumber: string;
  buildingName: string | null;
  street: string;
  landmark: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  defaultAddress: boolean;
}

export interface AddressPayload {
  label: string;
  houseNumber: string;
  buildingName: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

export const emptyAddressPayload: AddressPayload = {
  label: '',
  houseNumber: '',
  buildingName: '',
  street: '',
  landmark: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  latitude: null,
  longitude: null,
};

export const addressService = {
  getMyAddresses: (): Promise<UserAddress[]> =>
    api.get<UserAddress[]>('/addresses'),

  createAddress: (payload: AddressPayload): Promise<UserAddress> =>
    api.post<UserAddress>('/addresses', payload),

  updateAddress: (addressId: string, payload: AddressPayload): Promise<UserAddress> =>
    api.put<UserAddress>(`/addresses/${addressId}`, payload),

  deleteAddress: (addressId: string): Promise<void> =>
    api.delete<void>(`/addresses/${addressId}`),

  setDefaultAddress: (addressId: string): Promise<void> =>
    api.request<void>(`/addresses/${addressId}/default`, {
      method: 'PATCH',
    }),
};
