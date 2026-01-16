import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type HistoryItem = {
    smiles: string;
    model: number;
    result: string;
    time: string;
};

export function HistorySheet() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://127.0.0.1:8000/api/history", {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("获取历史记录失败");
                }

                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">历史记录</Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[600px] sm:w-[720px]">
                <SheetHeader>
                    <SheetTitle>历史预测记录</SheetTitle>
                </SheetHeader>

                <div className="mt-6">
                    {loading ? (
                        <p className="text-sm text-muted-foreground">
                            加载中...
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SMILES</TableHead>
                                    <TableHead>模型</TableHead>
                                    <TableHead>预测结果</TableHead>
                                    <TableHead>时间</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {history.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-muted-foreground"
                                        >
                                            暂无历史记录
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-mono">
                                                {item.smiles}
                                            </TableCell>
                                            <TableCell>
                                                模型 {item.model}
                                            </TableCell>
                                            <TableCell>
                                                {item.result}
                                            </TableCell>
                                            <TableCell>
                                                {item.time}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
