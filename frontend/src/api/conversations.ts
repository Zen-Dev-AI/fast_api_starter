import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, handleApiError } from './client';

export interface ConversationItem {
  thread_id: string;
  title: string;
  created_at: string;
}

export interface ConversationsResponse {
  conversations: ConversationItem[];
}

// API functions
const conversationsApi = {
  getConversations: async (): Promise<ConversationsResponse> => {
    return await apiClient
      .get('chat/conversations')
      .json<ConversationsResponse>();
  },

  createConversation: async (payload: {
    title: string;
    thread_id: string;
  }): Promise<ConversationItem> => {
    return await apiClient
      .post('chat/conversations', { json: payload })
      .json<ConversationItem>();
  },

  deleteConversation: async (threadId: string): Promise<void> => {
    await apiClient.delete(`chat/conversations/${threadId}`);
  },
};

// React Query hooks
export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: conversationsApi.getConversations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conversationsApi.createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Create conversation error:', handleApiError(error));
    },
  });
};

export const useDeleteConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conversationsApi.deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Delete conversation error:', handleApiError(error));
    },
  });
};

// Export the API functions for direct use if needed
export { conversationsApi };
