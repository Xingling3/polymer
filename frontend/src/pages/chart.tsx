import React, { useEffect, useState, useMemo } from "react"
import ReactECharts from "echarts-for-react"
import { userColumns, type UserModel } from "@/components/ui/user-columns"
import { DataTable } from "@/components/ui/datatable"

/* ======================
   数据请求
====================== */
const fetchData = async (): Promise<UserModel[]> => {
  const response = await fetch("/api/admin/user_models")
  if (!response.ok) {
    throw new Error(`网络请求失败: ${response.status}`)
  }
  const jsonData = await response.json()
  if (!Array.isArray(jsonData)) {
    throw new Error("返回的数据格式不正确")
  }
  return jsonData as UserModel[]
}

/* ======================
   统计逻辑
====================== */

// 每个用户有多少模型
function countModelsPerUser(data: UserModel[]) {
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
function buildChartData(data: UserModel[]) {
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
  const [data, setData] = useState<UserModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await fetchData()
        setData(result)
        setError(null)
      } catch (err) {
        console.error(err)
        setError("加载数据失败，请稍后重试")
        setData([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // ⭐ 统计数据只在 data 变化时重新计算
  const chartData = useMemo(() => buildChartData(data), [data])

  const chartOption = {
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
  }

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

  if (!data.length) {
    return (
      <div className="container mx-auto py-10 text-center">
        暂无用户模型数据
      </div>
    )
  }

  /* ======================
     正式渲染
  ====================== */
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">用户模型管理</h1>
        <p className="text-gray-500">
          用户模型数量分布统计与详细列表
        </p>
      </div>

      {/* 图表 */}
      <ReactECharts option={chartOption} style={{ height: 400 }} />

      {/* 表格 */}
      <DataTable columns={userColumns} data={data} />
    </div>
  )
}
