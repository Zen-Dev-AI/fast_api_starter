import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, handleApiError } from './client';

export interface Todo {
  id: number;
  title: string;
  description?: string;
}

export interface CreateTodoPayload {
  title: string;
  description?: string;
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string;
}

// API functions
const todoApi = {
  getTodos: async (): Promise<Todo[]> => {
    return await apiClient.get('todos').json<Todo[]>();
  },

  getTodo: async (id: number): Promise<Todo> => {
    return await apiClient.get(`todos/${id}`).json<Todo>();
  },

  createTodo: async (payload: CreateTodoPayload): Promise<Todo> => {
    return await apiClient.post('todos', { json: payload }).json<Todo>();
  },

  updateTodo: async ({
    id,
    ...payload
  }: UpdateTodoPayload & { id: number }): Promise<Todo> => {
    return await apiClient.put(`todos/${id}`, { json: payload }).json<Todo>();
  },

  deleteTodo: async (id: number): Promise<void> => {
    await apiClient.delete(`todos/${id}`);
  },
};

// React Query hooks
export const useTodos = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: todoApi.getTodos,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTodo = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: () => todoApi.getTodo(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTodoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      console.error('Create todo error:', handleApiError(error));
    },
  });
};

export const useUpdateTodoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.updateTodo,
    onSuccess: (updatedTodo) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.setQueryData(['todo', updatedTodo.id], updatedTodo);
    },
    onError: (error) => {
      console.error('Update todo error:', handleApiError(error));
    },
  });
};

export const useDeleteTodoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.deleteTodo,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.removeQueries({ queryKey: ['todo', deletedId] });
    },
    onError: (error) => {
      console.error('Delete todo error:', handleApiError(error));
    },
  });
};

// Export the API functions for direct use if needed
export { todoApi };
