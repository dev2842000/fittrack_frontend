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

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ message: string; email: string }>('/auth/register', data),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post<AuthResponse>('/auth/verify-otp', data),

  resendOtp: (data: { email: string }) =>
    api.post<{ message: string }>('/auth/resend-otp', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  refresh: () =>
    api.post<{ accessToken: string }>('/auth/refresh'),

  logout: () =>
    api.post('/auth/logout'),

  me: () => api.get<{ user: User }>('/auth/me'),
};
