import { useState } from "react"
import { ChatHeader } from "./ChatHeader"
import { ChatSettings } from "./ChatSettings"
import { ChatWindow } from "./ChatWindow"
import { useNavigate, useParams } from "react-router-dom";


export default function AIChatPlayground() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const [abortController, setAbortController] = useState<AbortController | null>(null)

    const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")
    const models = [
        { id: "gpt-3.5-turbo", name: "GPT-3.5" },
        { id: "gpt-4", name: "GPT-4" },
    ]
    const selectedModelName = models.find((m) => m.id === selectedModel)?.name || ""

    const [systemPrompt, setSystemPrompt] = useState("")
    const [temperature, setTemperature] = useState([0.7])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const stop = () => {
        if (abortController) {
            abortController.abort()
            setAbortController(null)
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        setError(null);

        // if (!id) {
        //     const newId = typeof crypto !== "undefined" && crypto.randomUUID
        //         ? crypto.randomUUID()
        //         : Date.now().toString(); // Fallback if crypto not available
        //     navigate(`/chat/${newId}`, { replace: true });
        //     return;
        // }

        const userMessageId = Date.now();
        const userMessage = { id: userMessageId, role: "user", content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const res = await fetch("http://localhost:8000/langgraph/chat-stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: userMessage.content,
                    model_name: selectedModel,
                    system_message: systemPrompt,
                    temperature: temperature[0],
                    thread_id: id || "tsest2",
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
                    .filter((line) => line.startsWith("data: "))
                    .map((line) => line.replace("data: ", ""));

                for (const line of lines) {
                    if (line === "[DONE]") continue;
                    if (line.startsWith("[ERROR]")) {
                        setError(new Error(line.replace("[ERROR]", "").trim()));
                        break;
                    }
                    const match = line.match(/content='(.*?)'/);
                    let contentValue = match ? match[1] : "";
                    contentValue = contentValue.replace(/\\n/g, "\n");

                    aiResponse += contentValue;

                    console.log(line)

                    setMessages((prev) => {
                        const lastIdx = [...prev]
                            .map((m, i) => m.id === assistantMessageId ? i : -1)
                            .filter(i => i !== -1)
                            .pop();

                        if (lastIdx !== undefined) {
                            const updated = [...prev];
                            updated[lastIdx] = {
                                ...updated[lastIdx],
                                content: updated[lastIdx].content + contentValue,
                            };
                            return updated;
                        } else {
                            return [...prev, { id: assistantMessageId, role: "assistant", content: contentValue }];
                        }
                    });
                }
            }
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
            setAbortController(null);
        }
    };


    const reload = () => {
        setError(null)
        handleSubmit(new Event("submit") as any)
    }

    const clearChat = () => {
        setMessages([])
        setInput("")
        setError(null)
    }

    const copyMessage = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <ChatHeader
                    onClear={clearChat}
                    showSettings={showSettings}
                    toggleSettings={() => setShowSettings(!showSettings)}
                />

                <div className={`grid gap-6 ${showSettings ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"}`}>
                    {showSettings && (
                        <div className="lg:col-span-1">
                            <ChatSettings
                                selectedModel={selectedModel}
                                setSelectedModel={setSelectedModel}
                                models={models}
                                systemPrompt={systemPrompt}
                                setSystemPrompt={setSystemPrompt}
                                temperature={temperature}
                                setTemperature={setTemperature}
                            />
                        </div>
                    )}

                    <div className={showSettings ? "lg:col-span-3" : "col-span-1"} style={{ height: "85vh" }}>
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
