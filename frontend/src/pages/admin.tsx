import React, { useEffect, useState, useMemo } from "react"
import ReactECharts from "echarts-for-react"
import { userColumns, type UserModel } from "@/components/ui/user-columns"
import { DataTable } from "@/components/ui/datatable"
import { type ColumnDef } from "@tanstack/react-table"

// 定义其他表的类型和列
type User = {
  id: number
  username: string
  created_at: string
}

const userTableColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "username",
    header: "用户名",
  },
  {
    accessorKey: "created_at",
    header: "创建时间",
    cell: ({ row }) => {
      const dateValue = row.getValue("created_at")
      if (!dateValue) return "未知时间"
      return new Date(dateValue as string).toLocaleString()
    },
  },
]

type PredictionHistory = {
  id: number
  user_id: number
  smiles: string
  model: number
  result: string
  created_at: string
}

const predictionHistoryColumns: ColumnDef<PredictionHistory>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "user_id",
    header: "用户ID",
  },
  {
    accessorKey: "smiles",
    header: "SMILES",
  },
  {
    accessorKey: "model",
    header: "模型",
  },
  {
    accessorKey: "result",
    header: "结果",
  },
  {
    accessorKey: "created_at",
    header: "创建时间",
    cell: ({ row }) => {
      const dateValue = row.getValue("created_at")
      if (!dateValue) return "未知时间"
      return new Date(dateValue as string).toLocaleString()
    },
  },
]

type Dataset = {
  id: number
  user_id: number
  url: string
}

const datasetColumns: ColumnDef<Dataset>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "user_id",
    header: "用户ID",
  },
  {
    accessorKey: "url",
    header: "URL",
  },
]

type AugmentDataset = {
  id: number
  user_id: number
  type: string
  url: string
}

const augmentDatasetColumns: ColumnDef<AugmentDataset>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "user_id",
    header: "用户ID",
  },
  {
    accessorKey: "type",
    header: "类型",
  },
  {
    accessorKey: "url",
    header: "URL",
  },
]

type Poly = {
  id: number
  smiles: string
  tg: number
}

const polyColumns: ColumnDef<Poly>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "smiles",
    header: "SMILES",
  },
  {
    accessorKey: "tg",
    header: "Tg",
  },
]

type Administer = {
  id: number
  username: string
}

type MLModel = {
  id: number
  name: string
  user_id: number
  path: string
  created_at: string
}

type TrainingResult = {
  id: number
  model_name: string
  model_id: number
  rmse: number
  r_squared: number
}

type DatasetFeature = {
  id: number
  dataset_id: number
  mean: number
  max: number
  min: number
  median: number
  pcd: number
}

const administerColumns: ColumnDef<Administer>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "username",
    header: "用户名",
  },
]

const mlModelColumns: ColumnDef<MLModel>[] = [
  {
    accessorKey: "id",
    header: "模型ID",
  },
  {
    accessorKey: "name",
    header: "模型名称",
  },
  {
    accessorKey: "user_id",
    header: "用户ID",
  },
  {
    accessorKey: "path",
    header: "地址",
  },
  {
    accessorKey: "created_at",
    header: "时间",
    cell: ({ row }) => {
      const dateValue = row.getValue("created_at")
      if (!dateValue) return "未知时间"
      return new Date(dateValue as string).toLocaleString()
    },
  },
]

const trainingResultColumns: ColumnDef<TrainingResult>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "model_name",
    header: "模型名称",
  },
  {
    accessorKey: "model_id",
    header: "模型ID",
  },
  {
    accessorKey: "rmse",
    header: "RMSE",
  },
  {
    accessorKey: "r_squared",
    header: "R方",
  },
]

const datasetFeatureColumns: ColumnDef<DatasetFeature>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "dataset_id",
    header: "数据集ID",
  },
  {
    accessorKey: "mean",
    header: "平均数",
  },
  {
    accessorKey: "max",
    header: "最大值",
  },
  {
    accessorKey: "min",
    header: "最小值",
  },
  {
    accessorKey: "median",
    header: "中位数",
  },
  {
    accessorKey: "pcd",
    header: "PCD",
  },
]

// 扩展 UserModel 以匹配后端返回的字段
type ExtendedUserModel = UserModel & {
  id: number
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

const extendedUserModelColumns: ColumnDef<ExtendedUserModel>[] = [

  {
    accessorKey: "user_id",
    header: "用户ID",
  },
  {
    accessorKey: "name",
    header: "名称",
  },
  {
    accessorKey: "description",
    header: "描述",
  },
  {
    accessorKey: "path",
    header: "路径",
  },
  {
    accessorKey: "created_at",
    header: "创建时间",
    cell: ({ row }) => {
      const dateValue = row.getValue("created_at")
      if (!dateValue) return "未知时间"
      return new Date(dateValue as string).toLocaleString()
    },
  },
  {
    accessorKey: "epoch",
    header: "Epoch",
  },
  {
    accessorKey: "batch",
    header: "Batch",
  },
  {
    accessorKey: "learning_rate",
    header: "学习率",
  },
  {
    accessorKey: "hidden_layer",
    header: "隐藏层",
  },
  {
    accessorKey: "cross_validate",
    header: "交叉验证",
  },
  {
    accessorKey: "test_proportion",
    header: "测试比例",
  },
  {
    accessorKey: "patience",
    header: "耐心",
  },
  // {
  //   accessorKey: "rmse_path",
  //   header: "RMSE路径",
  // },
  // {
  //   accessorKey: "predict_path",
  //   header: "预测路径",
  // },
]

// 通用列定义（用于未知表）
const genericColumns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "名称",
  },
  {
    accessorKey: "created_at",
    header: "创建时间",
    cell: ({ row }) => {
      const dateValue = row.getValue("created_at")
      if (!dateValue) return "未知时间"
      return new Date(dateValue as string).toLocaleString()
    },
  },
]

// 表列表
const tables = [
  { name: "users", label: "用户" },
  { name: "prediction_history", label: "预测历史" },
  { name: "user_models", label: "用户模型" },
  { name: "administer", label: "管理员" },
  { name: "augment_dataset", label: "增强数据集" },
  { name: "dataset", label: "数据集" },
  { name: "poly", label: "聚合物" },
  { name: "ml_models", label: "机器学习模型" },
  { name: "training_results", label: "模型训练结果" },
  { name: "dataset_features", label: "增强数据集特征" },
]

// 获取列定义的函数
const getColumns = (tableName: string): ColumnDef<any>[] => {
  switch (tableName) {
    case "users":
      return userTableColumns
    case "prediction_history":
      return predictionHistoryColumns
    case "user_models":
      return extendedUserModelColumns
    case "dataset":
      return datasetColumns
    case "augment_dataset":
      return augmentDatasetColumns
    case "poly":
      return polyColumns
    case "administer":
      return administerColumns
    case "ml_models":
      return mlModelColumns
    case "training_results":
      return trainingResultColumns
    case "dataset_features":
      return datasetFeatureColumns
    default:
      return genericColumns
  }
}
const getSearchKey = (tableName: string): string => {
  switch (tableName) {
    case "users":
      return "username"
    case "prediction_history":
      return "smiles"
    case "user_models":
      return "name"
    case "dataset":
      return "url"
    case "augment_dataset":
      return "url"
    case "poly":
      return "smiles"
    case "administer":
      return "username"
    case "ml_models":
      return "name"
    case "training_results":
      return "model_name"
    case "dataset_features":
      return "dataset_id"
    default:
      return "id"
  }
}

const getSearchPlaceholder = (tableName: string): string => {
  const searchKey = getSearchKey(tableName)
  switch (searchKey) {
    case "username":
      return "按用户名搜索..."
    case "smiles":
      return "按 SMILES 搜索..."
    case "name":
      return "按模型名称搜索..."
    case "url":
      return "按 URL 搜索..."
    case "model_name":
      return "按模型名称搜索..."
    case "dataset_id":
      return "按数据集ID搜索..."
    default:
      return "搜索..."
  }
}
// 数据请求
const fetchTableData = async (tableName: string): Promise<any[]> => {
  const response = await fetch(`/api/admin/${tableName}`)
  if (!response.ok) {
    throw new Error(`网络请求失败: ${response.status}`)
  }
  const jsonData = await response.json()
  if (!Array.isArray(jsonData)) {
    throw new Error("返回的数据格式不正确")
  }
  return jsonData
}

/* ======================
   统计逻辑
====================== */

// 每个用户有多少模型
function countModelsPerUser(data: any[]) {
  const map: Record<number, number> = {}

  data.forEach(item => {
    const userId = item.user_id // ⭐ 如果你字段不叫 user_id，改这里
    map[userId] = (map[userId] || 0) + 1
  })

  return map
}

// 模型数量 -> 用户数量
function countUsersByModelCount(perUser: Record<number, number>) {
  const result: Record<number, number> = {}

  Object.values(perUser).forEach(modelCount => {
    result[modelCount] = (result[modelCount] || 0) + 1
  })

  return result
}

// 生成 ECharts 数据
function buildChartData(data: any[]) {
  const perUser = countModelsPerUser(data)
  const distribution = countUsersByModelCount(perUser)

  const xAxis = Object.keys(distribution)
    .map(Number)
    .sort((a, b) => a - b)

  const series = xAxis.map(x => distribution[x])

  return { xAxis, series }
}

/* ======================
   页面组件
====================== */
export default function Admin() {
  const [selectedTable, setSelectedTable] = useState<string>("user_models")
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await fetchTableData(selectedTable)
        setTableData(result)
        setError(null)
      } catch (err) {
        console.error(err)
        setError("加载数据失败，请稍后重试")
        setTableData([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [selectedTable])

  const columns = useMemo(() => getColumns(selectedTable), [selectedTable])

  // 图表数据只在 user_models 时计算
  const chartData = useMemo(() => {
    if (selectedTable === "user_models") {
      return buildChartData(tableData)
    }
    return null
  }, [selectedTable, tableData])

  const chartOption = chartData ? {
    title: {
      text: "用户模型数量分布",
      left: "center"
    },
    tooltip: {
      trigger: "axis"
    },
    xAxis: {
      type: "category",
      name: "模型数量",
      data: chartData.xAxis
    },
    yAxis: {
      type: "value",
      name: "用户数量"
    },
    series: [
      {
        type: "bar",
        data: chartData.series,
        barWidth: "50%"
      }
    ]
  } : null

  /* ======================
     状态渲染
  ====================== */
  if (loading) {
    return <div className="container mx-auto py-10 text-center">加载中...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        {error}
      </div>
    )
  }

  /* ======================
     正式渲染
  ====================== */
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* 侧边栏 */}
      <div className="w-64 bg-white/70 backdrop-blur-xl border-r border-gray-200 p-4 shadow-sm">
        <h2 className="text-lg font-bold mb-4">数据表</h2>
        <ul>
          {tables.map((table) => (
            <li key={table.name} className="mb-2">
              <button
                onClick={() => setSelectedTable(table.name)}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-200
  ${selectedTable === table.name
                    ? "bg-blue-500 text-white shadow-md"
                    : "hover:bg-gray-100"
                  }`}
              >
                {table.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 p-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {tables.find(t => t.name === selectedTable)?.label} 管理
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            数据表管理与查看
          </p>
        </div>

        {/* 表格 */}

        <DataTable
          columns={columns}
          data={tableData}
          searchKey={getSearchKey(selectedTable)}
          searchPlaceholder={getSearchPlaceholder(selectedTable)}
        />


        {/* 图表 - 仅在 user_models 时显示 */}
        {selectedTable === "user_models" && chartOption && (
          <ReactECharts option={chartOption} style={{ height: 400, marginTop: 20 }} />
        )}
      </div>
    </div>
  )
}
