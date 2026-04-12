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
import { MoleculeViewer } from "./MoleculeViewer";
import Image from "@/assets/predict.png";

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
                // 请求 3D 分子
                const molResponse = await fetch("http://localhost:8000/api/mol3d", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        smiles,
                    }),
                });

                const molData = await molResponse.json();
                setMolBlock(molData.mol_block);

            } else {
                alert(data.detail || "预测失败");
            }
        } catch {
            alert("网络错误");
        } finally {
            setLoading(false);
        }
    };
    const [molBlock, setMolBlock] = useState<string | null>(null);

    return (

        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl">

                {/* 图片 */}
                <img
                    src={Image}
                    alt="Polymer AI Banner"
                    className="w-full h-[320px] object-cover"
                />

                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

                {/* 文字内容 */}
                <div className="absolute bottom-8 left-8 text-white">
                    <h1 className="text-4xl font-bold mb-2">
                        聚合物性质预测
                    </h1>

                </div>

            </div>
            <div className="flex items-center justify-between">

                <HistorySheet />
            </div>

            {/* SMILES 输入 + 模型选择 */}
            <InputGroup className="!bg-white h-14 text-base px-4 shadow-sm">
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
            {molBlock && (
                <div className="space-y-2">
                    <h2 className="font-semibold">3D 分子结构</h2>
                    <MoleculeViewer molBlock={molBlock} />
                </div>
            )}


        </div>
    );
}

