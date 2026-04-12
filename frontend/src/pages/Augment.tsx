import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    FieldGroup,
    FieldDescription,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import ReactECharts from "echarts-for-react"
import { Beaker, FileText, Database, Repeat, FolderOutput } from "lucide-react"
import Image from "@/assets/augment.png"

// --------------------- 类型定义 ---------------------
interface AnalysisResult {
    stats: {
        original: Record<string, number>
        augmented: Record<string, number>
    }
    distribution: {
        bins: number[]
        original: number[]
        augmented: number[]
    }
    similarity: {
        pcd: number
        label_kl: number
    }
}

interface AugmentResult {
    rows: number
    output: string
    analysis: AnalysisResult
}

// --------------------- 页面组件 ---------------------
export default function AugmentData() {
    const [trainFile, setTrainFile] = useState<File | null>(null)
    const [testFile, setTestFile] = useState<File | null>(null)

    const [trainPath, setTrainPath] = useState("")
    const [testPath, setTestPath] = useState("")
    //const [trainPath, setTrainPath] = useState("E:/project1/backend/strengthen/data/train.csv")
    // const [testPath, setTestPath] = useState("E:/project1/backend/strengthen/data/test.csv")
    const [outputPath, setOutputPath] = useState("E:/project1/backend/strengthen/data/augmented_data.csv")
    const [nTimes, setNTimes] = useState(1)

    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<AugmentResult | null>(null)
    const [error, setError] = useState<string | null>(null)


    // 新增状态
    const [compareLoading, setCompareLoading] = useState(false)
    const [compareAnalysis, setCompareAnalysis] = useState<AnalysisResult | null>(null)
    const [compareError, setCompareError] = useState<string | null>(null)

    // 新增函数
    const handleCompare = async () => {
        setCompareLoading(true)
        setCompareError(null)
        setCompareAnalysis(null)
        try {
            const res = await fetch("http://localhost:8000/api/compare") // 写死路径的 API
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.detail || "生成对比图失败")
            }
            setCompareAnalysis(data.data)
        } catch (err) {
            setCompareError(err instanceof Error ? err.message : "请求失败")
        } finally {
            setCompareLoading(false)
        }
    }

    // --------------------- 提交请求 ---------------------
    const handleSubmit = async () => {
        if (!trainFile || !testFile) {
            setError("请先选择 CSV 文件")
            return
        }

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const formData = new FormData()

            formData.append("train_file", trainFile)
            formData.append("test_file", testFile)
            formData.append("output_path", outputPath)
            formData.append("n_times", String(nTimes))

            const res = await fetch("http://localhost:8000/api/augment", {
                method: "POST",
                body: formData
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data.error || "数据增强失败")
            }

            setResult(data.data)

        } catch (err) {
            setError(err instanceof Error ? err.message : "请求失败")
        } finally {
            setLoading(false)
        }
    }

    // --------------------- ECharts 配置 ---------------------
    const getDistributionOption = (analysis: AnalysisResult) => ({
        tooltip: { trigger: "axis" },
        legend: { data: ["Original", "Augmented"] },
        xAxis: {
            type: "category",
            data: analysis.distribution.bins,
            name: "Tg 温度 (°C)"
        },
        yAxis: {
            type: "value",
            name: "频率"
        },
        series: [
            {
                name: "原始数据",
                type: "line",
                data: analysis.distribution.original,
                smooth: true
            },
            {
                name: "增强数据",
                type: "line",
                data: analysis.distribution.augmented,
                smooth: true
            }
        ]
    })

    const getStatsOption = (analysis: AnalysisResult) => {
        const keys = Object.keys(analysis.stats.original)
        return {
            tooltip: { trigger: "axis" },
            legend: { data: ["Original", "Augmented"] },
            xAxis: {
                type: "category",
                data: keys
            },
            yAxis: { type: "value" },
            series: [
                {
                    name: "原始数据",
                    type: "bar",
                    data: keys.map(k => analysis.stats.original[k])
                },
                {
                    name: "增强数据",
                    type: "bar",
                    data: keys.map(k => analysis.stats.augmented[k])
                }
            ]
        }
    }

    const getSimilarityOption = (analysis: AnalysisResult) => ({
        tooltip: {},
        radar: {
            indicator: [
                { name: "PCD", max: Math.max(analysis.similarity.pcd * 2, 1) },
                { name: "KL 散度", max: Math.max(analysis.similarity.label_kl * 2, 1) }
            ]
        },
        series: [
            {
                type: "radar",
                data: [
                    {
                        value: [
                            analysis.similarity.pcd,
                            analysis.similarity.label_kl
                        ],
                        name: "Distribution Difference"
                    }
                ]
            }
        ]
    })

    // --------------------- 页面渲染 ---------------------
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
                        数据增强
                    </h1>
                    <p className="text-white/80 max-w-xl">
                        本模块基于 RDKit 对分子 SMILES 表示进行数据增强，
                        通过 canonical 与 randomized SMILES 的组合，
                        扩充训练样本数量以提升模型泛化能力。
                    </p>
                </div>

            </div>

            {/* 错误提示 */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* 参数配置 */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/70 backdrop-blur-xl rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">

                {/* 顶部渐变背景 */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-90" />

                <CardHeader className="relative text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <Beaker className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">SMILES 数据增强配置</CardTitle>
                            <CardDescription className="text-blue-100">
                                基于 RDKit 随机化 SMILES 扩充训练样本
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="relative mt-6">
                    <FieldSet className="space-y-6">
                        <FieldGroup
                            className="
    relative
    p-5
    rounded-2xl
    bg-gradient-to-br from-blue-50 via-white to-indigo-50
    border border-blue-100
    shadow-sm
    transition-all duration-300
    hover:shadow-md
    hover:-translate-y-1
    hover:border-blue-400
  "
                        >
                            {/* 左侧装饰色条 */}
                            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-blue-500 to-indigo-500" />

                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-lg bg-blue-100 shadow-sm">
                                    <Database className="w-4 h-4 text-blue-600" />
                                </div>
                                <FieldLabel className="text-blue-900 font-semibold">
                                    训练集路径
                                </FieldLabel>
                            </div>

                            <Input
                                type="file"
                                accept=".csv"
                                className="
  bg-white
  border-blue-200
  focus:border-blue-500
  focus:ring-2
  focus:ring-blue-200
  transition-all
  "
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setTrainFile(file)
                                        setTrainPath(file.name)
                                    }
                                }}
                            />

                            {trainPath && (
                                <p className="text-xs text-blue-700 mt-2">
                                    已选择: {trainPath}
                                </p>
                            )}

                            <FieldDescription className="text-blue-700/80 mt-2">
                                包含 SMILES 与 Tg 标签的 CSV 文件
                            </FieldDescription>
                        </FieldGroup>

                        <FieldGroup
                            className="
    relative
    p-5
    rounded-2xl
    bg-gradient-to-br from-emerald-50 via-white to-teal-50
    border border-emerald-100
    shadow-sm
    transition-all duration-300
    hover:shadow-md
    hover:-translate-y-1
    hover:border-emerald-400
  "
                        >
                            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-emerald-500 to-teal-500" />

                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-lg bg-emerald-100 shadow-sm">
                                    <FileText className="w-4 h-4 text-emerald-600" />
                                </div>
                                <FieldLabel className="text-emerald-900 font-semibold">
                                    测试集路径
                                </FieldLabel>
                            </div>

                            <Input
                                type="file"
                                accept=".csv"
                                className="
  bg-white
  border-emerald-200
  focus:border-emerald-500
  focus:ring-2
  focus:ring-emerald-200
  transition-all
  "
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setTestFile(file)
                                        setTestPath(file.name)
                                    }
                                }}
                            />

                            {testPath && (
                                <p className="text-xs text-emerald-700 mt-2">
                                    已选择: {testPath}
                                </p>
                            )}

                            <FieldDescription className="text-emerald-700/80 mt-2">
                                测试数据将拼接至增强后的训练集
                            </FieldDescription>
                        </FieldGroup>

                        <FieldGroup
                            className="
    relative
    p-5
    rounded-2xl
    bg-gradient-to-br from-purple-50 via-white to-fuchsia-50
    border border-purple-100
    shadow-sm
    transition-all duration-300
    hover:shadow-md
    hover:-translate-y-1
    hover:border-purple-400
  "
                        >
                            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-purple-500 to-fuchsia-500" />

                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-lg bg-purple-100 shadow-sm">
                                    <FolderOutput className="w-4 h-4 text-purple-600" />
                                </div>
                                <FieldLabel className="text-purple-900 font-semibold">
                                    输出文件路径
                                </FieldLabel>
                            </div>

                            <Input
                                className="
      bg-white
      border-purple-200
      focus:border-purple-500
      focus:ring-2
      focus:ring-purple-200
      transition-all
    "
                                value={outputPath}
                                onChange={(e) => setOutputPath(e.target.value)}
                            />

                            <FieldDescription className="text-purple-700/80 mt-2">
                                增强后数据保存为 CSV 文件
                            </FieldDescription>
                        </FieldGroup>

                        <FieldGroup
                            className="
    relative
    p-5
    rounded-2xl
    bg-gradient-to-br from-amber-50 via-white to-orange-50
    border border-amber-100
    shadow-sm
    transition-all duration-300
    hover:shadow-md
    hover:-translate-y-1
    hover:border-amber-400
  "
                        >
                            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-amber-500 to-orange-500" />

                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-lg bg-amber-100 shadow-sm">
                                    <Repeat className="w-4 h-4 text-amber-600" />
                                </div>
                                <FieldLabel className="text-amber-900 font-semibold">
                                    增强倍数 (n_times)
                                </FieldLabel>
                            </div>

                            <Input
                                type="number"
                                min={1}
                                className="
      bg-white
      border-amber-200
      focus:border-amber-500
      focus:ring-2
      focus:ring-amber-200
      transition-all
    "
                                value={nTimes}
                                onChange={(e) => setNTimes(Number(e.target.value))}
                            />

                            <FieldDescription className="text-amber-700/80 mt-2">
                                每条样本生成 n 次随机 SMILES 表示
                            </FieldDescription>
                        </FieldGroup>

                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            size="lg"
                            className="w-full"
                        >
                            {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {loading ? "增强中..." : "开始数据增强"}
                        </Button>
                    </FieldSet>
                </CardContent>
            </Card>

            {/* 成功结果 */}
            {result && (
                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-white rounded-2xl transition-all duration-300 hover:shadow-2xl">

                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <CardTitle className="text-green-900">
                                    数据增强完成
                                </CardTitle>
                                <CardDescription>
                                    共生成 {result.rows} 行增强数据
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white p-4 rounded-lg mb-6">
                            <p className="text-sm text-gray-600 mb-1">输出文件路径</p>
                            <p className="text-sm font-mono break-all">
                                {result.output}
                            </p>
                        </div>

                        {/* ---------------- 分析图表 ---------------- */}
                        {result.analysis && (
                            <div className="space-y-10">
                                {/* 分布图 */}
                                <div>
                                    <h3 className="font-semibold mb-2">标签分布对比</h3>
                                    <ReactECharts
                                        option={getDistributionOption(result.analysis)}
                                        style={{ height: 350 }}
                                    />
                                </div>

                                {/* 统计图 */}
                                <div>
                                    <h3 className="font-semibold mb-2">统计指标对比</h3>
                                    <ReactECharts
                                        option={getStatsOption(result.analysis)}
                                        style={{ height: 350 }}
                                    />
                                </div>

                                {/* 相似度图 */}
                                <div>
                                    <h3 className="font-semibold mb-2">分布差异指标</h3>
                                    <ReactECharts
                                        option={getSimilarityOption(result.analysis)}
                                        style={{ height: 350 }}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

            )}
            <Card>
                <CardHeader>
                    <CardTitle>生成对比图</CardTitle>
                    <CardDescription>
                        点击读取 CSV 文件，生成分析对比图
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {compareError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{compareError}</AlertDescription>
                        </Alert>
                    )}
                    <Button
                        onClick={handleCompare}
                        disabled={compareLoading}
                        size="lg"
                        className="w-full"
                    >
                        {compareLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {compareLoading ? "生成中..." : "生成对比图"}
                    </Button>

                    {/* 对比图渲染 */}
                    {compareAnalysis && (
                        <div className="space-y-10 mt-6">
                            <div>
                                <h3 className="font-semibold mb-2">Tg温度分布对比</h3>
                                <ReactECharts
                                    option={getDistributionOption(compareAnalysis)}
                                    style={{ height: 350 }}
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">统计指标对比</h3>
                                <ReactECharts
                                    option={getStatsOption(compareAnalysis)}
                                    style={{ height: 350 }}
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">分布差异指标</h3>
                                <ReactECharts
                                    option={getSimilarityOption(compareAnalysis)}
                                    style={{ height: 350 }}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}