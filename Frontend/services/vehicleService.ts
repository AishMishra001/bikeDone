import { vmsApi } from './api';

// ─── Response Types ───────────────────────────────────────────────────────────

export interface VehicleBrand {
  id: string;
  brandName: string;
  brandCode: string;
  logoUrl: string | null;
  isActive: boolean;
}

export interface VehicleModel {
  id: string;
  modelName: string;
  modelCode: string;
  fuelType: string;
  transmissionType: string;
  engineCapacityCc: number | null;
  logoUrl: string | null;
}

export interface CustomerVehicle {
  id: string;
  brandName: string;
  modelName: string;
  registrationNumber: string;
  manufacturingYear: number | null;
  color: string | null;
  odometerKm: number;
  isDefault: boolean;
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface AddBikePayload {
  brandId: string;
  modelId: string;
  registrationNumber: string;
  manufacturingYear: number | null;
  color: string;
  engineNumber: string;
  chassisNumber: string;
  odometerKm: number;
  isDefault: boolean;
}

export interface UpdateBikePayload {
  color: string;
  manufacturingYear: number;
  odometerKm: number;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const vehicleService = {
  /** Fetch all active vehicle brands */
  getAllBrands: (): Promise<VehicleBrand[]> =>
    vmsApi.get<VehicleBrand[]>('/vehicle-brands'),

  /** Fetch models for a specific brand */
  getModelsByBrand: (brandId: string): Promise<VehicleModel[]> =>
    vmsApi.get<VehicleModel[]>(`/vehicle-models?brandId=${brandId}`),

  /** Add a new bike for the logged-in customer */
  addBike: (payload: AddBikePayload): Promise<CustomerVehicle> =>
    vmsApi.post<CustomerVehicle>('/customer-vehicles', payload),

  /** Get all bikes of the logged-in customer */
  getMyVehicles: (): Promise<CustomerVehicle[]> =>
    vmsApi.get<CustomerVehicle[]>('/customer-vehicles'),

  /** Get single bike by ID */
  getVehicleById: (vehicleId: string): Promise<CustomerVehicle> =>
    vmsApi.get<CustomerVehicle>(`/customer-vehicles/${vehicleId}`),

  /** Update bike details (color, year, odometer) */
  updateVehicle: (vehicleId: string, payload: UpdateBikePayload): Promise<CustomerVehicle> =>
    vmsApi.put<CustomerVehicle>(`/customer-vehicles/${vehicleId}`, payload),

  /** Delete a bike */
  deleteVehicle: (vehicleId: string): Promise<void> =>
    vmsApi.delete<void>(`/customer-vehicles/${vehicleId}`),

  /** Set a bike as default */
  setDefaultVehicle: (vehicleId: string): Promise<CustomerVehicle> =>
    vmsApi.request<CustomerVehicle>(`/customer-vehicles/${vehicleId}/default`, {
      method: 'PATCH',
    }),
};
