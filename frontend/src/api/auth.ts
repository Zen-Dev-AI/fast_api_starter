import api from './axiosBase';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.detail || 'Registration failed';
    throw new Error(message);
  }
}

export async function loginUser(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.detail || 'Login failed';
    throw new Error(message);
  }
}

export const logout = () => {
  localStorage.removeItem('user');
};
