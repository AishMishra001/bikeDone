import { api } from "./api";

export interface WalletData {
  walletId?: string;
  userId: string;
  userType: string;
  balance: number;
  currency: string;
  isActive: boolean;
  activatedAt?: string;
  welcomeBonusGranted?: number;
}

export interface WalletTransactionData {
  id: string;
  walletId: string;
  amount: number;
  transactionType: "CREDIT" | "DEBIT";
  purpose: string;
  description?: string;
  referenceId?: string;
  createdAt: string;
}

export const walletService = {
  /**
   * Fetch current mechanic wallet info from UMS
   */
  async getMyWallet(userId: string): Promise<WalletData | null> {
    try {
      const response = await api.get<WalletData>(
        `/wallets/me?userId=${userId}`,
        { targetService: "UMS", requiresAuth: true }
      );
      return response;
    } catch (error) {
      return null;
    }
  },

  /**
   * Send activation OTP to mechanic's registered phone
   */
  async sendActivationOtp(userId: string): Promise<boolean> {
    try {
      await api.post<void>(
        `/wallets/send-otp?userId=${userId}`,
        undefined,
        { targetService: "UMS", requiresAuth: true }
      );
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Verify OTP and activate wallet with initial bonus
   */
  async activateWallet(userId: string, otp: string): Promise<WalletData | null> {
    try {
      const response = await api.post<WalletData>(
        `/wallets/activate?userId=${userId}`,
        { otp },
        { targetService: "UMS", requiresAuth: true }
      );
      return response;
    } catch (error) {
      console.warn("Wallet activation failed:", error);
      return null;
    }
  },

  /**
   * Fetch transaction history
   */
  async getTransactions(userId: string): Promise<WalletTransactionData[]> {
    try {
      const response = await api.get<WalletTransactionData[]>(
        `/wallets/transactions?userId=${userId}`,
        { targetService: "UMS", requiresAuth: true }
      );
      return response || [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Top-up wallet balance via Razorpay
   */
  async topupWallet(userId: string, amount: number, paymentMethod: string = "RAZORPAY_UPI"): Promise<WalletData | null> {
    try {
      const response = await api.post<WalletData>(
        `/wallets/topup?userId=${userId}`,
        { amount, paymentMethod },
        { targetService: "UMS", requiresAuth: true }
      );
      return response;
    } catch (error) {
      console.warn("Wallet topup failed:", error);
      return null;
    }
  },
};
