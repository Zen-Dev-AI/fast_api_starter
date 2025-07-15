import { useEffect, useRef, useState } from "react"
import ChatHeader from "./ChatHeader"
import { ChatWindow } from "./ChatWindow"
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/authProvider";
import { useConversations } from "@/context/conversationProvider";



export default function AIChatPlayground() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isNew = searchParams.get("isNew") === "true";
    const { user } = useAuth()

    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<any[]>([])
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    useEffect(() => {
        if (!id || isNew) return

        const loadHistory = async () => {
            setIsLoading(true)
            setError(null)
            try {
                // const res = await fetch(`http://localhost:8000/langchain/conversations/${id}/messages`, {
                const res = await fetch(`http://localhost:8000/langgraph/chat-history/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user?.token}`,
                    },
                })
                if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`)
                const history = (await res.json()) as { id: number; role: string; content: string }[]

                console.log("Chat history loaded:", history)
                setMessages(history.messages.map(m => ({ id: m.id, role: m.role, content: m.content })))
            } catch (err: any) {
                console.log(err)
            } finally {
                setIsLoading(false)
            }
        }

        loadHistory()
    }, [id, user, isNew])


    /**
     * Inserts a new assistant message if none exists, or replaces its content
     * with the full `content` string.
     */
    const upsertMessage = (
        messages: any[],
        id: string | number,
        content: string
    ): any[] => {
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
        const userMessage = { id: userMessageId, role: "user", content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        const controller = new AbortController()
        abortControllerRef.current = controller

        try {

            const res = await fetch("http://localhost:8000/langgraph/chat-stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`,
                },
                body: JSON.stringify({
                    prompt: userMessage.content,
                    model_name: selectedModel,
                    system_message: systemPrompt,
                    temperature: temperature[0],
                    thread_id: id,
                }),
                signal: controller.signal,
            });



            const reader = res.body?.getReader();
            const decoder = new TextDecoder("utf-8");
            let aiResponse = "";
            const assistantMessageId = `ai-${userMessageId}`;

            if (!reader) throw new Error("No response stream");

            while (true) {
                const { value, done } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk
                    .split("\n")
                    .filter((l) => l.startsWith("data: "))
                    .map((l) => l.replace("data: ", ""));

                console.log()

                for (const line of lines) {
                    console.log(line)

                    const data = JSON.parse(line);

                    const chunkText = data.content as string;


                    aiResponse += chunkText;

                    setMessages((prev) => upsertMessage(prev, assistantMessageId, aiResponse));
                }
            }

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
