import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { api } from "@/lib/axios";

interface PromptsInterface {
    id: string;
    title: string;
    template: string;
}

export default function PromptSelect({ onChange }: { onChange: (template: string) => void }) {

    const [prompts, setPrompts] = useState<PromptsInterface[]>([])

    useEffect(() => {
        const getPrompts = async () => {
            const { data } = await api.get('prompts')
            setPrompts(data)
        }

        getPrompts()
    }, [])

    return (
        <div className="space-y-1">
            <Label>Prompt</Label>
            <Select onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione um prompt..." />
                </SelectTrigger>

                <SelectContent>
                    {prompts.map(p => <SelectItem key={p.id} value={p.template}>{p.title}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    )
}