import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Settings } from "lucide-react"

interface Props {
    selectedModel: string
    setSelectedModel: (val: string) => void
    models: { id: string; name: string }[]
    systemPrompt: string
    setSystemPrompt: (val: string) => void
    temperature: number[]
    setTemperature: (val: number[]) => void
}

export function ChatSettings({
    selectedModel,
    setSelectedModel,
    models,
    systemPrompt,
    setSystemPrompt,
    temperature,
    setTemperature,
}: Props) {
    return (
        <div className="card p-6 space-y-6">
            <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Settings</h2>
            </div>
            <div className="space-y-2">
                <Select
                    value={models.find((m) => m.id === selectedModel)?.name}
                    onValueChange={(name) => {
                        const model = models.find((m) => m.name === name)
                        if (model) setSelectedModel(model.id)
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent className="border-4 bg-white">
                        {models.map((model) => (
                            <SelectItem key={model.id} value={model.name}>
                                {model.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">System Prompt</label>
                <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Enter system prompt..."
                    rows={3}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Temperature: {temperature[0]}</label>
                <Slider value={temperature} onValueChange={setTemperature} max={2} min={0} step={0.1} />
            </div>
        </div>
    )
}
