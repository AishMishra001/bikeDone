import { vmsApi } from "./api";

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

export interface RequestType {
  id: number;
  code: string;
  displayName: string;
  description: string;
}

export interface ServiceCategory {
  id: number;
  code: string;
  displayName: string;
  iconUrl: string | null;
}

export interface ServiceSlot {
  id: string;
  slotName: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
}

export interface ServiceIssue {
  id: number;
  code: string;
  displayName: string;
}

export interface CreateServiceRequestPayload {
  customerVehicleId: string;
  addressId: string;
  requestTypeId: number;
  preferredServiceDate: string;
  serviceSlotId: string;
  isIssueIdentified: boolean;
  serviceCategoryId?: number;
  serviceIssueIds?: number[];
  description?: string;
}

export interface CreateServiceRequestResponse {
  id: string;
  requestNumber: string;
  status: string;
}

export interface MyServiceRequest {
  id: string;
  requestNumber: string;
  requestType: string;
  status: string;
  preferredServiceDate: string;
  serviceSlot: string;
  customerVehicleId: string;
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
    vmsApi.get<VehicleBrand[]>("/vehicle-brands"),

  /** Fetch models for a specific brand */
  getModelsByBrand: (brandId: string): Promise<VehicleModel[]> =>
    vmsApi.get<VehicleModel[]>(`/vehicle-models?brandId=${brandId}`),

  /** Add a new bike for the logged-in customer */
  addBike: (payload: AddBikePayload): Promise<CustomerVehicle> =>
    vmsApi.post<CustomerVehicle>("/customer-vehicles", payload),

  /** Get all bikes of the logged-in customer */
  getMyVehicles: (): Promise<CustomerVehicle[]> =>
    vmsApi.get<CustomerVehicle[]>("/customer-vehicles"),

  /** Get single bike by ID */
  getVehicleById: (vehicleId: string): Promise<CustomerVehicle> =>
    vmsApi.get<CustomerVehicle>(`/customer-vehicles/${vehicleId}`),

  /** Update bike details (color, year, odometer) */
  updateVehicle: (
    vehicleId: string,
    payload: UpdateBikePayload,
  ): Promise<CustomerVehicle> =>
    vmsApi.put<CustomerVehicle>(`/customer-vehicles/${vehicleId}`, payload),

  /** Delete a bike */
  deleteVehicle: (vehicleId: string): Promise<void> =>
    vmsApi.delete<void>(`/customer-vehicles/${vehicleId}`),

  /** Set a bike as default */
  setDefaultVehicle: (vehicleId: string): Promise<CustomerVehicle> =>
    vmsApi.request<CustomerVehicle>(`/customer-vehicles/${vehicleId}/default`, {
      method: "PATCH",
    }),

  /** Fetch request types that can be selected when booking a service */
  getRequestTypes: (): Promise<RequestType[]> =>
    vmsApi.get<RequestType[]>("/request-types"),

  /** Fetch service categories (used when issue is identified) */
  getServiceCategories: (): Promise<ServiceCategory[]> =>
    vmsApi.get<ServiceCategory[]>("/service-categories"),

  /** Fetch all available active service slots */
  getServiceSlots: (): Promise<ServiceSlot[]> =>
    vmsApi.get<ServiceSlot[]>("/service-slots"),

  /** Fetch issues for a specific service category */
  getServiceIssues: (categoryId: number): Promise<ServiceIssue[]> =>
    vmsApi.get<ServiceIssue[]>(`/service-issues?categoryId=${categoryId}`),

  /** Create a new service request */
  createServiceRequest: (
    payload: CreateServiceRequestPayload,
  ): Promise<CreateServiceRequestResponse> =>
    vmsApi.post<CreateServiceRequestResponse>("/service-requests", payload),

  /** Get the logged-in customer's service requests */
  getMyServiceRequests: (): Promise<MyServiceRequest[]> =>
    vmsApi.get<MyServiceRequest[]>("/service-requests"),

  /** Cancel an existing service request */
  cancelServiceRequest: (
    requestId: string,
    reason: string,
  ): Promise<CreateServiceRequestResponse> =>
    vmsApi.request<CreateServiceRequestResponse>(
      `/service-requests/${requestId}/cancel`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      },
    ),
};
