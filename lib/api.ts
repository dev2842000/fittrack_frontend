import axios from 'axios';

const KEY = 'fittrack_token';
const ls = () => (typeof window !== 'undefined' ? window.localStorage : null);

export const setAccessToken = (token: string) => ls()?.setItem(KEY, token);
export const clearAccessToken = () => ls()?.removeItem(KEY);
export const getAccessToken = () => ls()?.getItem(KEY) ?? null;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // sends httpOnly refresh cookie on every request
});

api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config;
    // On 401, try refreshing once — but not if this IS the refresh call (avoid loop)
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/refresh')) {
      original._retry = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        clearAccessToken();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
