import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
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

  me: () => api.get<{ user: User }>('/auth/me'),
};

export const saveToken = (token: string) =>
  localStorage.setItem('fittrack_token', token);

export const getToken = () =>
  localStorage.getItem('fittrack_token');

export const removeToken = () =>
  localStorage.removeItem('fittrack_token');
