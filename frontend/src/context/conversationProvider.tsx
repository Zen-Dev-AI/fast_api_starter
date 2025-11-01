// src/context/ConversationContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DashNavItemsI } from '@/components/NavMain';
import { useConversations as useConversationsQuery } from '@/api/conversations';

export interface ConversationMeta {
    thread_id: string;
    title: string;
    created_at: string;
}

interface ConversationsContextValue {
    conversations: DashNavItemsI[];
    addConversation: (meta: ConversationMeta) => void;
    removeConversation: (threadId: string) => void;
    isLoading: boolean;
    error: Error | null;
}

const ConversationsContext = createContext<ConversationsContextValue | undefined>(undefined);

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
    const [conversations, setConversations] = useState<DashNavItemsI[]>([]);

    // Use React Query to fetch conversations
    const { data: conversationsData, isLoading, error } = useConversationsQuery();

    // Update local state when React Query data changes
    useEffect(() => {
        if (conversationsData?.conversations) {
            setConversations(
                conversationsData.conversations.map((conv) => ({
                    title: conv.title || conv.thread_id,
                    url: `/dashboard/chat/${conv.thread_id}`,
                }))
            );
        }
    }, [conversationsData]);

    const addConversation = (meta: ConversationMeta) => {
        const newItem: DashNavItemsI = {
            title: meta.title || meta.thread_id,
            url: `/dashboard/chat/${meta.thread_id}`,
        };
        setConversations(prev =>
            [newItem, ...prev.filter(item => item.url !== newItem.url)]
        );
    };

    const removeConversation = (threadId: string) => {
        setConversations(prev => prev.filter(c => !c.url.endsWith(threadId)))
    }

    return (
        <ConversationsContext.Provider value={{
            conversations,
            addConversation,
            removeConversation,
            isLoading,
            error
        }}>
            {children}
        </ConversationsContext.Provider>
    );
}

export function useConversations() {
    const ctx = useContext(ConversationsContext);
    if (!ctx) throw new Error('useConversations must be used within ConversationsProvider');
    return ctx;
}
