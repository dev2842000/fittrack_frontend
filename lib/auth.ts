import axios from 'axios';
import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Auth calls go through the Next.js proxy (/api/auth/...) so the httpOnly
// cookie is set on vercel.app — first-party, works on Safari and PWA.
const authProxy = axios.create({
  baseURL: '/api/auth',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    authProxy.post<{ message: string; email: string }>('/register', data),

  verifyOtp: (data: { email: string; otp: string }) =>
    authProxy.post<AuthResponse>('/verify-otp', data),

  resendOtp: (data: { email: string }) =>
    authProxy.post<{ message: string }>('/resend-otp', data),

  login: (data: { email: string; password: string }) =>
    authProxy.post<AuthResponse>('/login', data),

  refresh: () =>
    authProxy.post<{ accessToken: string }>('/refresh'),

  logout: () =>
    authProxy.post('/logout'),

  me: () => api.get<{ user: User }>('/auth/me'),
};
