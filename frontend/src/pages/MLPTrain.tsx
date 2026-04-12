import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Image from "@/assets/machine.jpg"
interface TrainingConfig {
    train_data_path: string
    test_data_path: string
    model_name: string
    n_splits: number
    max_iter: number
    hidden_layer_sizes: [number, number]
}

interface TrainingResult {
    message: string
    training_results: {
        avg_rmse: number
        avg_r2: number
        rmse_scores: number[]
        r2_scores: number[]
    }
    model_info: {
        model_path: string
        scaler_path: string
    }
}

interface PredictionResult {
    smiles: string
    predicted_tg: number
    message: string
}

export default function MLPTrain() {
    const [trainFile, setTrainFile] = useState<File | null>(null)
    const [testFile, setTestFile] = useState<File | null>(null)
    const [config, setConfig] = useState<TrainingConfig>({
        train_data_path: "E:/project1/backend/machine/dataset_train.csv",
        test_data_path: "E:/project1/backend/machine/dataset_test.csv",
        model_name: "mlp_model",
        n_splits: 2,
        max_iter: 1000,
        hidden_layer_sizes: [100, 50],
    })

    const [smiles, setSmiles] = useState("")
    const [trainingLoading, setTrainingLoading] = useState(false)
    const [predictLoading, setPredictLoading] = useState(false)
    const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null)
    const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleConfigChange = (field: keyof TrainingConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleTrain = async () => {
        if (!trainFile || !testFile) {
            setError("请先选择 CSV 文件")
            return
        }

        setTrainingLoading(true)
        setError(null)
        setTrainingResult(null)

        try {
            const formData = new FormData()

            formData.append("train_file", trainFile)
            formData.append("test_file", testFile)
            formData.append("model_name", config.model_name)
            formData.append("n_splits", String(config.n_splits))
            formData.append("max_iter", String(config.max_iter))
            formData.append(
                "hidden_layer_sizes",
                JSON.stringify(config.hidden_layer_sizes)
            )

            const response = await fetch(
                "http://localhost:8000/api/train_mlp",
                {
                    method: "POST",
                    body: formData,
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "训练失败")
            }

            const data = await response.json()
            setTrainingResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "训练过程中出错")
        } finally {
            setTrainingLoading(false)
        }
    }

    const handlePredict = async () => {
        if (!smiles.trim()) {
            setError("请输入 SMILES 序列")
            return
        }

        setPredictLoading(true)
        setError(null)
        setPredictionResult(null)

        try {
            const response = await fetch("http://localhost:8000/api/predict_mlp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    smiles: smiles.trim(),
                    model_path: "E:/project1/backend/machine/mlp_model_20260208_023157.pkl",
                    scaler_path: "E:/project1/backend/machine/mlp_model_scaler_20260208_023157.pkl",
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "预测失败")
            }

            const data = await response.json()
            setPredictionResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "预测过程中出错")
        } finally {
            setPredictLoading(false)
        }
    }

    return (


        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            {/* 页面标题与说明 */}
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
                        机器学习模型训练与预测
                    </h1>
                    <p className="text-white/80 max-w-xl">
                        本模块使用 Morgan 指纹和 MLP 回归模型预测分子的 Tg 温度
                    </p>
                </div>

            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="training" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="training">训练模型</TabsTrigger>
                    <TabsTrigger value="prediction">预测</TabsTrigger>
                </TabsList>

                <TabsContent value="training">
                    <Card>
                        <CardHeader>
                            <CardTitle>模型训练配置</CardTitle>
                            <CardDescription>
                                配置训练参数并开始训练 MLP 模型
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldSet className="space-y-6">
                                <FieldGroup>
                                    <FieldLabel>训练数据 CSV</FieldLabel>

                                    <Input
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                setTrainFile(file)
                                                handleConfigChange("train_data_path", file.name)
                                            }
                                        }}
                                    />

                                    {config.train_data_path && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            已选择: {config.train_data_path}
                                        </p>
                                    )}

                                    <FieldDescription>
                                        CSV 文件应包含 'smiles' 和 'tg' 列
                                    </FieldDescription>
                                </FieldGroup>

                                {/* <FieldGroup>
                                    <FieldLabel>训练数据路径</FieldLabel>
                                    <Input
                                        value={config.train_data_path}
                                        onChange={(e) =>
                                            handleConfigChange("train_data_path", e.target.value)
                                        }
                                        placeholder="输入训练数据 CSV 文件路径"
                                    />
                                    <FieldDescription>
                                        相对于项目根目录的路径，CSV 文件应包含 'smiles' 和 'tg' 列
                                    </FieldDescription>
                                </FieldGroup> */}

                                <FieldGroup>
                                    <FieldLabel>测试数据 CSV</FieldLabel>

                                    <Input
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                setTestFile(file)
                                                handleConfigChange("test_data_path", file.name)
                                            }
                                        }}
                                    />

                                    {config.test_data_path && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            已选择: {config.test_data_path}
                                        </p>
                                    )}

                                    <FieldDescription>
                                        测试集 CSV 文件
                                    </FieldDescription>
                                </FieldGroup>

                                <FieldSeparator />

                                <FieldGroup>
                                    <FieldLabel>交叉验证折数</FieldLabel>
                                    <Input
                                        type="number"
                                        value={config.n_splits}
                                        onChange={(e) =>
                                            handleConfigChange("n_splits", parseInt(e.target.value))
                                        }
                                        placeholder="2"
                                        min="2"
                                    />
                                    <FieldDescription>
                                        进行 n-fold 交叉验证
                                    </FieldDescription>
                                </FieldGroup>

                                <FieldGroup>
                                    <FieldLabel>最大迭代次数</FieldLabel>
                                    <Input
                                        type="number"
                                        value={config.max_iter}
                                        onChange={(e) =>
                                            handleConfigChange("max_iter", parseInt(e.target.value))
                                        }
                                        placeholder="1000"
                                        min="100"
                                    />
                                    <FieldDescription>
                                        神经网络训练的最大迭代次数
                                    </FieldDescription>
                                </FieldGroup>

                                <FieldGroup>
                                    <FieldLabel>隐藏层神经元数量</FieldLabel>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <Input
                                                type="number"
                                                value={config.hidden_layer_sizes[0]}
                                                onChange={(e) =>
                                                    handleConfigChange("hidden_layer_sizes", [
                                                        parseInt(e.target.value),
                                                        config.hidden_layer_sizes[1],
                                                    ])
                                                }
                                                placeholder="100"
                                                min="10"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">第一层</p>
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                type="number"
                                                value={config.hidden_layer_sizes[1]}
                                                onChange={(e) =>
                                                    handleConfigChange("hidden_layer_sizes", [
                                                        config.hidden_layer_sizes[0],
                                                        parseInt(e.target.value),
                                                    ])
                                                }
                                                placeholder="50"
                                                min="10"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">第二层</p>
                                        </div>
                                    </div>
                                    <FieldDescription>
                                        配置神经网络的隐藏层结构
                                    </FieldDescription>
                                </FieldGroup>

                                <Button
                                    onClick={handleTrain}
                                    disabled={trainingLoading}
                                    size="lg"
                                    className="w-full"
                                >
                                    {trainingLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {trainingLoading ? "训练中..." : "开始训练"}
                                </Button>
                            </FieldSet>
                        </CardContent>
                    </Card>

                    {trainingResult && (
                        <Card className="mt-6 border-green-200 bg-green-50">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <CardTitle className="text-green-900">
                                        训练完成
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-green-700">
                                    {trainingResult.message}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">平均 RMSE</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {trainingResult.training_results.avg_rmse.toFixed(4)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">平均 R²</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {trainingResult.training_results.avg_r2.toFixed(4)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">各折评分</p>
                                    <div className="space-y-2">
                                        {trainingResult.training_results.rmse_scores.map(
                                            (rmse, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span>第 {idx + 1} 折 RMSE:</span>
                                                    <span className="font-semibold">
                                                        {rmse.toFixed(4)}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">模型保存位置</p>
                                    <p className="text-sm break-all font-mono">
                                        {trainingResult.model_info.model_path}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="prediction">
                    <Card>
                        <CardHeader>
                            <CardTitle>分子属性预测</CardTitle>
                            <CardDescription>
                                输入 SMILES 序列来预测分子的 Tg 温度
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FieldGroup>
                                <FieldLabel>SMILES 序列</FieldLabel>
                                <Textarea
                                    value={smiles}
                                    onChange={(e) => setSmiles(e.target.value)}
                                    placeholder="例如: CC(=O)Oc1ccccc1C(=O)O"
                                    rows={4}
                                />
                                <FieldDescription>
                                    输入要预测的分子 SMILES 序列
                                </FieldDescription>
                            </FieldGroup>

                            <Button
                                onClick={handlePredict}
                                disabled={predictLoading || !smiles.trim()}
                                size="lg"
                                className="w-full"
                            >
                                {predictLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {predictLoading ? "预测中..." : "开始预测"}
                            </Button>
                        </CardContent>
                    </Card>

                    {predictionResult && (
                        <Card className="mt-6 border-blue-200 bg-blue-50">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    <CardTitle className="text-blue-900">
                                        预测结果
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-white p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">SMILES 序列</p>
                                    <p className="text-sm font-mono break-all mt-1">
                                        {predictionResult.smiles}
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">预测 Tg 温度 (℃)</p>
                                    <p className="text-4xl font-bold text-blue-600 mt-2">
                                        {predictionResult.predicted_tg.toFixed(2)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
