import { api } from "./api";

export interface IncomingJobRequest {
  requestId: string;
  customerName?: string;
  customerMobile?: string;
  issueDescription?: string;
  latitude: number;
  longitude: number;
  addressNote?: string;
  dispatchRound: number;
  timeoutSeconds: number;
}

export const dispatchService = {
  /**
   * Update current mechanic location & online availability in UMS
   */
  async updateLocation(
    mechanicId: string,
    latitude: number,
    longitude: number,
    isOnline: boolean = false
  ): Promise<void> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      isOnline: isOnline.toString(),
    });

    await api.post<void>(
      `/mechanics/${mechanicId}/location?${params.toString()}`,
      undefined,
      { targetService: "UMS" }
    );
  },

  /**
   * Fetch current mechanic location & duty status from UMS DB
   */
  async getLocation(mechanicId: string): Promise<{ isOnline: boolean; isBusy: boolean } | null> {
    try {
      const response = await api.get<{ isOnline: boolean; isBusy: boolean } | null>(
        `/mechanics/${mechanicId}/location`,
        { targetService: "UMS", requiresAuth: true }
      );
      return response;
    } catch (error) {
      return null;
    }
  },

  /**
   * Accept incoming service request atomically in OMS
   */
  async acceptRequest(requestId: string, mechanicId: string): Promise<boolean> {
    try {
      const response = await api.post<boolean>(
        `/service-requests/${requestId}/accept?mechanicId=${mechanicId}`,
        undefined,
        { targetService: "OMS" }
      );
      return response;
    } catch (error) {
      console.warn("Accept request failed:", error);
      return false;
    }
  },

  /**
   * Fetch active pending job notification for mechanic from OMS
   */
  async getPendingNotification(mechanicId: string): Promise<IncomingJobRequest | null> {
    try {
      const response = await api.get<IncomingJobRequest | null>(
        `/service-requests/mechanics/${mechanicId}/pending-notifications`,
        { targetService: "OMS", requiresAuth: true }
      );
      return response;
    } catch (error) {
      return null;
    }
  },

  /**
   * Fetch active job for mechanic from OMS
   */
  async getActiveJob(mechanicId: string): Promise<any | null> {
    try {
      const response = await api.get<any | null>(
        `/service-requests/mechanics/${mechanicId}/active`,
        { targetService: "OMS", requiresAuth: true }
      );
      return response;
    } catch (error) {
      // Return null if not found (404)
      return null;
    }
  },
};
