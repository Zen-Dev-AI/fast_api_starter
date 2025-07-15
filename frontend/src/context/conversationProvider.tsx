// src/context/ConversationContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
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
    removeConversation: (threadId: string) => void;
}

const ConversationsContext = createContext<ConversationsContextValue | undefined>(undefined);

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<DashNavItemsI[]>([]);

    useEffect(() => {
        if (!user?.token) return;
        async function loadConversations() {
            try {
                const res = await fetch('http://localhost:8000/langgraph/conversations', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user?.token}`,
                    },
                });
                if (!res.ok) throw new Error(await res.text());

                const data = (await res.json()).conversations;
                console.log(data)
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
        setConversations(prev =>
            [newItem, ...prev.filter(item => item.url !== newItem.url)]
        );
    };

    const removeConversation = (threadId: string) => {
        setConversations(prev => prev.filter(c => !c.url.endsWith(threadId)))
    }

    return (
        <ConversationsContext.Provider value={{ conversations, addConversation, removeConversation }}>
            {children}
        </ConversationsContext.Provider>
    );
}

export function useConversations() {
    const ctx = useContext(ConversationsContext);
    if (!ctx) throw new Error('useConversations must be used within ConversationsProvider');
    return ctx;
}
