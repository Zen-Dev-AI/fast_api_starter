import ky from 'ky';

// Create the main API client
export const apiClient = ky.create({
  prefixUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem('token');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          console.error('API error:', response.status, response.statusText);
        }
        return response;
      },
    ],
  },
});

// Utility function for handling API errors
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
