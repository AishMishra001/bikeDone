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
    isOnline: boolean = true
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
};
