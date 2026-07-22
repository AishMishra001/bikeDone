import { Platform } from 'react-native';

let memoryToken: string | null = null;
let memoryRefreshToken: string | null = null;
let memoryUser: string | null = null;

export interface LoggedInUser {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobileNumber: string;
  role: string;
}

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem('access_token');
      } catch (e) {
        console.warn('Error reading from localStorage:', e);
      }
    }
    return memoryToken;
  },

  async setAccessToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('access_token', token);
      } catch (e) {
        console.warn('Error writing to localStorage:', e);
      }
    }
    memoryToken = token;
  },

  async getRefreshToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem('refresh_token');
      } catch (e) {
        console.warn('Error reading from localStorage:', e);
      }
    }
    return memoryRefreshToken;
  },

  async setRefreshToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('refresh_token', token);
      } catch (e) {
        console.warn('Error writing to localStorage:', e);
      }
    }
    memoryRefreshToken = token;
  },

  async getUser(): Promise<LoggedInUser | null> {
    if (Platform.OS === 'web') {
      try {
        const userStr = localStorage.getItem('user_details');
        return userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        console.warn('Error reading user details:', e);
      }
    }
    return memoryUser ? JSON.parse(memoryUser) : null;
  },

  async setUser(user: LoggedInUser): Promise<void> {
    const userStr = JSON.stringify(user);
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('user_details', userStr);
      } catch (e) {
        console.warn('Error writing user details:', e);
      }
    }
    memoryUser = userStr;
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_details');
      } catch (e) {
        console.warn('Error clearing localStorage:', e);
      }
    }
    memoryToken = null;
    memoryRefreshToken = null;
    memoryUser = null;
  }
};
