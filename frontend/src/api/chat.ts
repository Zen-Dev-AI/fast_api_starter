import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, handleApiError } from './client';

export interface ChatMessage {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatHistory {
  messages: ChatMessage[];
}

export interface ChatStreamPayload {
  prompt: string;
  model_name: string;
  system_message: string;
  temperature: number;
  thread_id: string;
}

export interface Conversation {
  thread_id: string;
  title: string;
  created_at: string;
}

// API functions
const chatApi = {
  getChatHistory: async (threadId: string): Promise<ChatHistory> => {
    return await apiClient
      .get(`chat/chat-history/${threadId}`)
      .json<ChatHistory>();
  },

  streamChat: async (
    payload: ChatStreamPayload,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<void> => {
    const response = await apiClient.post('chat/chat-stream', {
      json: payload,
      signal,
    });

    if (!response.body) {
      throw new Error('No response stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split('\n')
          .filter((l) => l.startsWith('data: '))
          .map((l) => l.replace('data: ', ''));

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              const chunkText = data.content as string;
              if (chunkText) {
                onChunk(chunkText);
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

// React Query hooks
export const useChatHistory = (
  threadId: string | undefined,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ['chatHistory', threadId],
    queryFn: () => chatApi.getChatHistory(threadId!),
    enabled: enabled && !!threadId,
    staleTime: 0, // Always fetch fresh chat history
  });
};

export const useChatStreamMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      onChunk,
      signal,
    }: {
      payload: ChatStreamPayload;
      onChunk: (chunk: string) => void;
      signal?: AbortSignal;
    }) => {
      return chatApi.streamChat(payload, onChunk, signal);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch chat history after successful stream
      queryClient.invalidateQueries({
        queryKey: ['chatHistory', variables.payload.thread_id],
      });
    },
    onError: (error) => {
      console.error('Chat stream error:', handleApiError(error));
    },
  });
};

// Export the API functions for direct use if needed
export { chatApi };
