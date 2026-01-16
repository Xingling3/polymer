import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { HistorySheet } from "./HistorySheet";

export default function PolymerPredict() {
    const [smiles, setSmiles] = useState("");
    const [model, setModel] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        if (!smiles || model === null) {
            alert("请输入SMILES序列并选择模型");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/api/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    smiles,
                    model: Number(model),
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setResult(String(data.result));
            } else {
                alert(data.detail || "预测失败");
            }
        } catch {
            alert("网络错误");
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="p-6 max-w-xl space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">聚合物性质预测平台</h1>
                <HistorySheet />
            </div>

            {/* SMILES 输入 + 模型选择 */}
            <InputGroup className="[--radius:1rem]">
                <InputGroupInput
                    placeholder="输入 SMILES 序列，如 C"
                    value={smiles}
                    onChange={(e) => setSmiles(e.target.value)}
                />

                <InputGroupAddon align="inline-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <InputGroupButton
                                variant="ghost"
                                className="!pr-2 text-xs"
                            >
                                {model !== null ? `模型 ${model}` : "选择模型"}
                                <ChevronDownIcon className="ml-1 size-3" />
                            </InputGroupButton>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setModel("0")}>
                                模型 0
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setModel("1")}>
                                模型 1
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </InputGroupAddon>
            </InputGroup>

            <Button onClick={handlePredict} disabled={loading}>
                {loading ? "预测中..." : "预测"}
            </Button>

            {result && (
                <div className="p-4 bg-muted rounded-lg">
                    <h2 className="font-semibold">预测结果</h2>
                    <p className="mt-1">{result}</p>
                </div>
            )}
        </div>
    );
}

