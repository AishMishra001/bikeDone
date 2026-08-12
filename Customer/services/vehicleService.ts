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
  itemId?: string;
  itemCode?: string;
  itemDisplayName?: string;
  brandName: string;
  modelName: string;
  registrationNumber: string;
  manufacturingYear: number | null;
  color: string | null;
  odometerKm: number;
  isDefault: boolean;
  vehicleData?: {
    "customer-bike-image"?: string[];
  };
}

export interface Item {
  id: string;
  itemCode: string;
  displayName: string;
  description: string;
}

export interface PricingEstimateResponse {
  itemId: string;
  itemCode: string;
  itemDisplayName: string;
  requestTypeId: number;
  requestTypeCode: string;
  requestTypeDisplayName: string;
  baseCharge: number;
  convenienceFee: number;
  platformFee: number;
  subtotal: number;
  discountAmount: number;
  appliedCouponCode: string | null;
  couponTitle: string | null;
  taxableAmount: number;
  gstPercentage: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalPayableAmount: number;
  couponApplied: boolean;
  couponMessage: string | null;
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
  /** 24-hour time string, e.g. "09:00" or "13:30" */
  slotTime: string;
}

export interface ServiceIssue {
  id: number;
  code: string;
  displayName: string;
}

export interface CreateServiceRequestPayload {
  customerVehicleId: string;
  addressId?: string;
  /** When addressId is set, also send the address coordinates + formatted text */
  addressLatitude?: number | null;
  addressLongitude?: number | null;
  addressNote?: string;
  requestTypeId: number;
  isImmediate: boolean;
  preferredServiceDate?: string;
  preferredServiceTime?: string;
  isIssueIdentified: boolean;
  serviceCategoryId?: number;
  serviceIssueIds?: number[];
  description?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    note?: string;
  };
  imageUrls?: string[];
  couponCode?: string;
  itemId?: string;
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
  preferredServiceDate: string | null;
  preferredServiceTime: string | null;
  isImmediate: boolean;
  serviceSlot: string | null;
  customerVehicleId: string;
  vehicleName: string | null;
  vehicleRegistrationNumber: string | null;
  serviceAddress: string | null;
  description: string | null;
  imageUrls: string[];
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface AddBikePayload {
  itemId?: string;
  brandId: string;
  modelId: string;
  registrationNumber: string;
  manufacturingYear: number | null;
  color: string;
  engineNumber: string;
  chassisNumber: string;
  odometerKm: number;
  isDefault: boolean;
  imageUrls?: string[];
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

  /** Fetch models for a specific brand and optional vehicle item */
  getModelsByBrand: (brandId: string, itemId?: string): Promise<VehicleModel[]> =>
    vmsApi.get<VehicleModel[]>(`/vehicle-models?brandId=${brandId}${itemId ? `&itemId=${itemId}` : ""}`),

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

  /** Fetch active items (Bike, Scooty, Car, TV, Washing Machine) */
  getItems: (): Promise<Item[]> =>
    vmsApi.get<Item[]>("/pricing/items"),

  /** Fetch pricing estimate including fees, coupon discounts, and GST */
  getPricingEstimate: (
    itemId?: string,
    itemCode?: string,
    requestTypeId?: number,
    requestTypeCode?: string,
    couponCode?: string,
  ): Promise<PricingEstimateResponse> => {
    const params: string[] = [];
    if (itemId) params.push(`itemId=${encodeURIComponent(itemId)}`);
    if (itemCode) params.push(`itemCode=${encodeURIComponent(itemCode)}`);
    if (requestTypeId) params.push(`requestTypeId=${requestTypeId}`);
    if (requestTypeCode) params.push(`requestTypeCode=${encodeURIComponent(requestTypeCode)}`);
    if (couponCode) params.push(`couponCode=${encodeURIComponent(couponCode)}`);
    const query = params.length > 0 ? `?${params.join("&")}` : "";
    return vmsApi.get<PricingEstimateResponse>(`/pricing/estimate${query}`);
  },

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

  /** Get a single service request by ID */
  getServiceRequestById: (requestId: string): Promise<MyServiceRequest> =>
    vmsApi.get<MyServiceRequest>(`/service-requests/${requestId}`),

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

  /** Reschedule an existing service request */
  rescheduleServiceRequest: (
    requestId: string,
    preferredServiceDate: string,
    preferredServiceTime: string,
  ): Promise<CreateServiceRequestResponse> =>
    vmsApi.request<CreateServiceRequestResponse>(
      `/service-requests/${requestId}/reschedule`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredServiceDate, preferredServiceTime }),
      },
    ),
};
