import { api } from './api';
import { tokenStorage } from './tokenStorage';

export const authService = {

  /**
   * Backend ko logout call karo → sare refresh tokens revoke honge.
   * Chahe API fail ho, local tokens hamesha clear honge.
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();

      if (refreshToken) {
        // Backend pe POST /auth/logout — sare sessions revoke
        await api.post<void>(
          '/auth/logout',
          { refreshToken },
          { requiresAuth: false }   // access token already expire ho sakta hai
        );
      }
    } catch (err) {
      // Silently ignore — token already expired ya network error
      // Local clear hoga regardless
      console.warn('[authService] logout API error (ignored):', err);
    } finally {
      // Always clear local storage
      await tokenStorage.clear();
    }
  },
};
