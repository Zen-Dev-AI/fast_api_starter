// components/AIChat.tsx

import { useState } from "react"

export default function AIChat() {
    const [input, setInput] = useState("")
    const [response, setResponse] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setResponse("")
        setLoading(true)

        const res = await fetch("http://localhost:8000/chat-stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: input }),
        })

        const reader = res.body?.getReader()
        const decoder = new TextDecoder("utf-8")

        if (!reader) {
            setLoading(false)
            return
        }

        while (true) {
            const { value, done } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })

            const lines = chunk
                .split("\n")
                .filter(line => line.startsWith("data: "))
                .map(line => line.replace("data: ", "").trim())

            for (const line of lines) {
                if (line === "[DONE]") {
                    setLoading(false)
                    return
                }
                if (line.startsWith("[ERROR]")) {
                    console.error(line)
                    setResponse("⚠️ " + line)
                    setLoading(false)
                    return
                }
                setResponse(prev => prev + line)
            }
        }

        setLoading(false)
    }


    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded shadow space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask the AI..."
                    className="flex-grow border border-gray-300 px-3 py-2 rounded"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "..." : "Send"}
                </button>
            </form>

            <div className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-100 p-3 rounded min-h-[100px]">
                {response || (loading ? "Waiting for response..." : "Response will appear here.")}
            </div>
        </div>
    )
}
