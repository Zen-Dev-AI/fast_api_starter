import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, handleApiError } from './client';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// API functions
const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      return await apiClient
        .post('auth/register', { json: payload })
        .json<AuthResponse>();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed';
      throw new Error(message);
    }
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      return await apiClient
        .post('auth/login', { json: payload })
        .json<AuthResponse>();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed';
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  ping: async (): Promise<{ message: string }> => {
    return await apiClient.get('ping').json<{ message: string }>();
  },
};

// React Query hooks
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApi.register,
    onError: (error) => {
      console.error('Registration error:', handleApiError(error));
    },
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApi.login,
    onError: (error) => {
      console.error('Login error:', handleApiError(error));
    },
  });
};

export const usePingQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['ping'],
    queryFn: authApi.ping,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Export the API functions for direct use if needed
export { authApi };
