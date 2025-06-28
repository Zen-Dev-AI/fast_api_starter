import axios from 'axios';

console.log();

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API error', err);
    return Promise.reject(err);
  },
);

export async function fetchPing(): Promise<{ message: string }> {
  const response = await api.get<{ message: string }>('/ping');
  if (!response.data) {
    throw new Error('No response data');
  }
  return response.data;
}

export default api;
