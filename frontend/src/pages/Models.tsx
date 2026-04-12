import { useEffect, useState } from "react"
import ReactECharts from "echarts-for-react"
import styled from "styled-components"
import DeleteButton from "@/components/DeleteButton";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ModelItem {
    id: number
    name: string
    description: string
}

interface ModelDetail {
    id: number
    name: string
    description: string
    path: string
    epoch: number
    batch: number
    learning_rate: number
    hidden_layer: number
    cross_validate: string
    test_proportion: number
    patience: number
    rmse_path: string
    predict_path: string
}

export default function ModelPage() {
    const [models, setModels] = useState<ModelItem[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [detail, setDetail] = useState<ModelDetail | null>(null)
    const [loading, setLoading] = useState(false)

    const [selectedModelA, setSelectedModelA] = useState("xx模型1")
    const [selectedModelB, setSelectedModelB] = useState("深度模型2")

    const compareModels = [
        {
            name: "机器学习模型1",
            experiments: [
                { label: "案例1", rmse: 1.08, r2: 0.88 },
                { label: "案例2", rmse: 0.95, r2: 0.92 },
            ],
        },
        {
            name: "机器学习模型2",
            experiments: [
                { label: "案例1", rmse: 1.20, r2: 0.84 },
                { label: "案例2", rmse: 1.02, r2: 0.89 },
            ],
        },
        {
            name: "深度学习模型1",
            experiments: [
                { label: "案例1", rmse: 0.88, r2: 0.94 },
                { label: "案例2", rmse: 0.80, r2: 0.96 },
            ],
        },
        {
            name: "深度学习模型2",
            experiments: [
                { label: "案例1", rmse: 0.95, r2: 0.91 },
                { label: "案例2", rmse: 0.83, r2: 0.93 },
            ],
        },
    ]

    const modelA = compareModels.find((item) => item.name === selectedModelA) || compareModels[0]
    const modelB = compareModels.find((item) => item.name === selectedModelB) || compareModels[1]

    const compareOption = {
        tooltip: {
            trigger: "axis",
        },
        legend: {
            data: [
                `${modelA.name} RMSE`,
                `${modelA.name} R2`,
                `${modelB.name} RMSE`,
                `${modelB.name} R2`,
            ],
        },
        xAxis: {
            type: "category",
            data: modelA.experiments.map((it) => it.label),
        },
        yAxis: [
            {
                type: "value",
                name: "RMSE",
                position: "left",
            },
            {
                type: "value",
                name: "R2",
                position: "right",
                min: 0,
                max: 1.0,
            },
        ],
        series: [
            {
                name: `${modelA.name} RMSE`,
                type: "bar",
                data: modelA.experiments.map((it) => it.rmse),
                yAxisIndex: 0,
            },
            {
                name: `${modelA.name} R2`,
                type: "line",
                data: modelA.experiments.map((it) => it.r2),
                yAxisIndex: 1,
                smooth: true,
            },
            {
                name: `${modelB.name} RMSE`,
                type: "bar",
                data: modelB.experiments.map((it) => it.rmse),
                yAxisIndex: 0,
            },
            {
                name: `${modelB.name} R2`,
                type: "line",
                data: modelB.experiments.map((it) => it.r2),
                yAxisIndex: 1,
                smooth: true,
            },
        ],
    }

    useEffect(() => {
        fetch("http://localhost:8000/api/models", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setModels(data))
    }, [])

    const fetchDetail = async (id: number) => {
        setLoading(true)
        setSelectedId(id)

        const res = await fetch(
            `http://localhost:8000/api/models/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        )

        const data = await res.json()
        setDetail(data)
        setLoading(false)
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("确定要删除这个模型吗？")) {
            return
        }

        try {
            const res = await fetch(
                `http://localhost:8000/api/models/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            )

            if (res.ok) {
                // 删除成功，刷新模型列表
                setModels(models.filter(m => m.id !== id))
                // 如果弹窗中显示的是被删除的模型，关闭弹窗
                if (selectedId === id) {
                    setSelectedId(null)
                }
                alert("模型已删除")
            } else {
                alert("删除失败")
            }
        } catch (error) {
            console.error("删除失败:", error)
            alert("删除出错")
        }
    }

    const gradients = [
        "linear-gradient(135deg,#3b82f6,#6366f1)",
        "linear-gradient(135deg,#ec4899,#f43f5e)",
        "linear-gradient(135deg,#10b981,#22c55e)",
        "linear-gradient(135deg,#f59e0b,#f97316)",
        "linear-gradient(135deg,#8b5cf6,#6366f1)",
    ]

    return (
        <StyledWrapper>
            <div className="compare-panel">
                <h2>模型对比：RMSE vs R2（静态示例）</h2>
                <div className="selectors">
                    <div>
                        <label>模型 A</label>
                        <select value={selectedModelA} onChange={(e) => setSelectedModelA(e.target.value)}>
                            {compareModels.map((m) => (
                                <option key={m.name} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>模型 B</label>
                        <select value={selectedModelB} onChange={(e) => setSelectedModelB(e.target.value)}>
                            {compareModels.map((m) => (
                                <option key={m.name} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="chart">
                    <ReactECharts option={compareOption} style={{ height: 360, width: '100%' }} />
                </div>
            </div>

            <div className="cards">
                {models.map((model, index) => (
                    <div
                        key={model.id}
                        className="card"
                        style={{ background: gradients[index % gradients.length] }}
                        onClick={() => fetchDetail(model.id)}
                    >
                        <div className="content">
                            <h3>{model.name}</h3>
                            <p>{model.description || "暂无描述"}</p>
                        </div>

                        <div
                            className="actions"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DeleteButton onClick={() => handleDelete(model.id)} />
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
                <AlertDialogContent className="max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {detail?.name || "模型详情"}
                        </AlertDialogTitle>

                        <AlertDialogDescription className="space-y-2">
                            {loading && <div>加载中...</div>}

                            {detail && (
                                <>
                                    <div>📄 描述：{detail.description}</div>
                                    <div>📁 模型路径：{detail.path}</div>
                                    <div>⏱ 训练轮数：{detail.epoch}</div>
                                    <div>📦 批大小：{detail.batch}</div>
                                    <div>📉 学习率：{detail.learning_rate}</div>
                                    <div>🧠 隐藏层数：{detail.hidden_layer}</div>
                                    <div>🔁 交叉验证：{detail.cross_validate}</div>
                                    <div>🧪 测试比例：{detail.test_proportion}</div>
                                    <div>⏳ 耐心值：{detail.patience}</div>
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>关闭</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div`
  .cards {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .card {
    width: 80%;
    padding: 20px;
    border-radius: 18px;
    color: white;
    transition: 400ms transform, 400ms box-shadow, 400ms filter;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    cursor: pointer;
  }

  .card h3 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .card p {
    font-size: 14px;
    opacity: 0.9;
  }

  .actions {
    margin-top: 15px;
  }

  .card:hover {
    transform: scale(1.05);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }

  .cards:hover > .card:not(:hover) {
    filter: blur(4px);
    transform: scale(0.95);
  }

  .compare-panel {
    width: 100%;
    max-width: 980px;
    margin-bottom: 24px;
    padding: 16px;
    border-radius: 18px;
    box-shadow: 0 8px 22px rgba(0,0,0,.12);
    background: #ffffff;
  }

  .compare-panel h2 {
    margin-bottom: 12px;
    font-size: 18px;
  }

  .selectors {
    display: flex;
    gap: 14px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  .selectors > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .selectors select {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    background: #fff;
  }

  .chart {
    height: 360px;
  }
`