// src/context/ConversationContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { DashNavItemsI } from '@/components/NavMain';
import { useAuth } from '@/context/authProvider';

export interface ConversationMeta {
    thread_id: string;
    title: string;
    created_at: string;
}

interface ConversationsContextValue {
    conversations: DashNavItemsI[];
    addConversation: (meta: ConversationMeta) => void;
}

const ConversationsContext = createContext<ConversationsContextValue | undefined>(undefined);

export function ConversationsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<DashNavItemsI[]>([]);

    useEffect(() => {
        if (!user?.token) return;
        async function loadConversations() {
            try {
                const res = await fetch('http://localhost:8000/langchain/conversations', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user?.token}`,
                    },
                });
                if (!res.ok) throw new Error(await res.text());
                const data = (await res.json()) as ConversationMeta[];
                setConversations(
                    data.map(conv => ({
                        title: conv.title || conv.thread_id,
                        url: `/dashboard/chat/${conv.thread_id}`,
                    }))
                );
            } catch {
                // handle or ignore
            }
        }
        loadConversations();
    }, [user]);

    const addConversation = (meta: ConversationMeta) => {
        meta
        const newItem: DashNavItemsI = {
            title: meta.title || meta.thread_id,
            url: `/dashboard/chat/${meta.thread_id}`,
        };
        setConversations(prev => [newItem, ...prev]);
    };

    return (
        <ConversationsContext.Provider value={{ conversations, addConversation }}>
            {children}
        </ConversationsContext.Provider>
    );
}

export function useConversations() {
    const ctx = useContext(ConversationsContext);
    if (!ctx) throw new Error('useConversations must be used within ConversationsProvider');
    return ctx;
}
