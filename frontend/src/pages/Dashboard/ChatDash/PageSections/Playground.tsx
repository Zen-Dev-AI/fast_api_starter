import { useEffect, useRef, useState } from "react"
import ChatHeader from "./ChatHeader"
import { ChatWindow } from "./ChatWindow"
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/authProvider";
import { useConversations } from "@/context/conversationProvider";
import { useChatHistory, useChatStreamMutation, type ChatMessage } from "@/api/chat";



export default function AIChatPlayground() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isNew = searchParams.get("isNew") === "true";
    const { user } = useAuth()

    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const abortControllerRef = useRef<AbortController | null>(null)

    const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")
    const models = [
        { id: "gpt-3.5-turbo", name: "GPT-3.5" },
        { id: "gpt-4", name: "GPT-4" },
    ]
    const selectedModelName = models.find((m) => m.id === selectedModel)?.name || ""

    const [systemPrompt, setSystemPrompt] = useState("")
    const [temperature, setTemperature] = useState([0.7])

    const { conversations, addConversation } = useConversations()

    // React Query hooks
    const { data: chatHistory, isLoading: isHistoryLoading } = useChatHistory(
        id,
        !isNew && !!id && !!user?.token
    )
    const chatStreamMutation = useChatStreamMutation()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    useEffect(() => {
        if (chatHistory?.messages) {
            setMessages(chatHistory.messages.map(m => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content
            })))
        }
    }, [chatHistory])

    useEffect(() => {
        if (isHistoryLoading) {
            setIsLoading(true)
        } else {
            setIsLoading(false)
        }
    }, [isHistoryLoading])


    /**
     * Inserts a new assistant message if none exists, or replaces its content
     * with the full `content` string.
     */
    const upsertMessage = (
        messages: ChatMessage[],
        id: string | number,
        content: string
    ): ChatMessage[] => {
        const idx = messages.findIndex((m) => m.id === id);
        if (idx > -1) {
            // update in place
            const updated = [...messages];
            updated[idx] = { ...updated[idx], content };
            return updated;
        } else {
            // first time, push a new message
            return [...messages, { id, role: "assistant", content }];
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        setError(null);

        const userMessageId = Date.now();
        const userMessage: ChatMessage = {
            id: userMessageId,
            role: "user",
            content: input.trim()
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        const controller = new AbortController()
        abortControllerRef.current = controller

        let aiResponse = "";
        const assistantMessageId = `ai-${userMessageId}`;

        try {
            await chatStreamMutation.mutateAsync({
                payload: {
                    prompt: userMessage.content,
                    model_name: selectedModel,
                    system_message: systemPrompt,
                    temperature: temperature[0],
                    thread_id: id || "",
                },
                onChunk: (chunkText: string) => {
                    aiResponse += chunkText;
                    setMessages((prev) => upsertMessage(prev, assistantMessageId, aiResponse));
                },
                signal: controller.signal,
            });

        } catch (err: any) {
            if (!abortControllerRef.current) setError(err);
        } finally {
            setIsLoading(false);
            const created_at = new Date().toISOString()
            const threadId = id || ""

            const exists = conversations.some(c =>
                c.url.endsWith(threadId)
            );

            if (!exists) {
                addConversation({
                    thread_id: threadId,
                    title: userMessage.content,
                    created_at: created_at || new Date().toISOString(),
                });
            }
            abortControllerRef.current = null
        }
    };

    const stop = () => {
        const c = abortControllerRef.current
        if (c) {
            c.abort()
            setIsLoading(false)
        }
    }

    const reload = () => {
        setError(null)
        handleSubmit(new Event("submit") as any)
    }

    const copyMessage = (text: string) => {
        navigator.clipboard.writeText(text)
    }


    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <ChatHeader
                    threadId={id!}
                    showSettings={showSettings}
                    toggleSettings={() => setShowSettings((prev) => !prev)}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    models={models}
                    systemPrompt={systemPrompt}
                    setSystemPrompt={setSystemPrompt}
                    temperature={temperature}
                    setTemperature={setTemperature}
                />

                <div className={`grid gap-6`}>

                    <div className={showSettings ? "lg:col-span-3" : "col-span-1"} style={{ height: "70vh" }}>
                        <ChatWindow
                            messages={messages}
                            input={input}
                            onInputChange={handleInputChange}
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                            error={error}
                            onRetry={reload}
                            selectedModelName={selectedModelName}
                            copyMessage={copyMessage}
                            stop={stop}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
