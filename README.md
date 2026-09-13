<div align="center">

# 聚智通

### 基于分子表示与机器学习的聚合物性质预测平台

面向材料与化学科研场景，提供分子解析、三维可视化、性质预测、模型训练、数据增强和结果管理的一站式 Web 工作台。

[功能概览](#功能概览) · [快速开始](#快速开始) · [数据格式](#数据格式) · [接口文档](#接口文档) · [开发说明](#开发说明)

</div>

> [!IMPORTANT]
> 本项目目前处于开发原型阶段，适合课程设计、科研探索和功能演示。模型输出仅用于辅助筛选，不能替代规范实验测量或专业判断。

## 项目简介

聚智通旨在降低聚合物性质预测工具的使用门槛。用户可以通过 SMILES 表示输入分子结构，查看三维构象与基础分子描述符，调用预测接口，并基于自己的数据训练 MLP 回归模型。平台还提供数据增强、模型配置、预测历史和后台数据管理等功能。

项目采用前后端分离架构：前端负责交互、可视化和任务配置，后端负责身份认证、数据持久化、化学信息处理及机器学习任务。

## 功能概览

| 模块 | 当前能力 |
| --- | --- |
| 用户系统 | 用户注册、登录、JWT 身份认证与用户数据隔离 |
| 分子解析 | 解析 SMILES，生成三维 MolBlock 结构 |
| 分子描述符 | 计算分子量、分子式、LogP、TPSA、氢键供体与受体、原子数和可旋转键数 |
| 性质预测 | 提供聚合物性质预测接口与预测结果展示 |
| MLP 训练 | 使用 Morgan 指纹和多层感知机完成 Tg 回归训练、交叉验证、模型保存与加载 |
| 数据增强 | 通过规范化和随机化 SMILES 扩充样本，并比较增强前后的标签分布 |
| 模型管理 | 保存、查询和删除用户模型及训练配置 |
| 过程追溯 | 保存用户预测历史，支持按时间查询 |
| 管理后台 | 查看用户、数据集、模型、预测历史与训练结果等数据 |

## 技术栈

### 前端

- React 19、TypeScript、Vite
- Tailwind CSS、Radix UI
- ECharts、Recharts
- React Router、TanStack Table
- KaTeX、3Dmol.js

### 后端与算法

- FastAPI、SQLAlchemy、SQLite、JWT
- RDKit、NumPy、Pandas、SciPy
- scikit-learn、joblib
- Morgan 指纹、MLP 回归、随机化 SMILES 数据增强

## 系统流程

```text
SMILES / CSV 数据
        │
        ▼
分子解析与数据校验
        │
        ├── 三维结构与描述符计算
        ├── 性质预测与历史记录
        ├── MLP 模型训练与评估
        └── SMILES 数据增强与分布比较
        │
        ▼
网页可视化、模型管理与结果追溯
```

## 项目结构

```text
polymer/
├── backend/
│   ├── main.py                 # FastAPI 应用与接口
│   ├── auth.py                 # JWT 身份认证
│   ├── database.py             # SQLite 与 SQLAlchemy 配置
│   ├── models.py               # 数据模型
│   ├── mol3d.py                # 三维分子结构生成
│   ├── GCN/
│   │   └── predict.py          # GCN 预测接口原型
│   ├── machine/
│   │   └── train_model.py      # Morgan 指纹与 MLP 训练
│   └── strengthen/
│       ├── augment.py          # SMILES 数据增强
│       └── analysis.py         # 增强前后分布分析
├── frontend/
│   ├── src/pages/              # 业务页面
│   ├── src/components/         # 通用组件
│   ├── public/                 # 静态资源
│   └── package.json
└── README.md
```

## 快速开始

### 1. 获取项目

```bash
git clone https://github.com/Xingling3/polymer.git
cd polymer
```

### 2. 准备后端环境

推荐使用 Python 3.10，并通过 Conda 安装 RDKit：

```bash
conda create -n polymer-env python=3.10 -y
conda activate polymer-env
conda install -c conda-forge rdkit -y
pip install fastapi uvicorn sqlalchemy pydantic python-jose python-multipart numpy pandas scipy scikit-learn joblib
```

启动后端：

```bash
cd backend
uvicorn main:app --reload
```

后端默认运行在 `http://localhost:8000`，交互式接口文档位于 `http://localhost:8000/docs`。

### 3. 启动前端

打开新的终端窗口：

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`。首次使用时先注册账号，再登录并进入各功能页面。

## 数据格式

### MLP 训练数据

训练集和测试集均使用 CSV 文件，并包含以下表头：

```csv
smiles,tg
CCO,120.5
CCN,135.2
```

- `smiles`：分子的 SMILES 表示。
- `tg`：目标玻璃化转变温度数值。

### SMILES 数据增强

增强模块读取两列 CSV，第一列为 SMILES，第二列为目标性质。当前实现按无表头文件处理：

```csv
CCO,120.5
CCN,135.2
```

## 接口文档

启动后端后，可以在 Swagger 页面中调试全部接口：

```text
http://localhost:8000/docs
```

主要接口如下：

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| POST | `/api/register` | 注册用户 |
| POST | `/api/login` | 登录并获取访问令牌 |
| POST | `/api/mol3d` | 生成三维结构并计算分子描述符 |
| POST | `/api/predict` | 调用性质预测接口 |
| GET | `/api/history` | 查询当前用户的预测历史 |
| POST | `/api/train_config` | 保存模型训练配置 |
| GET | `/api/models` | 获取当前用户的模型列表 |
| POST | `/api/train_mlp` | 上传数据并训练 MLP 模型 |
| POST | `/api/predict_mlp` | 使用已保存的 MLP 模型预测 |
| POST | `/api/augment` | 执行 SMILES 数据增强 |
| GET | `/api/compare` | 比较原始数据与增强数据的分布 |

需要身份认证的接口应在请求头中携带令牌：

```text
Authorization: Bearer <access_token>
```

## 开发说明

在其他计算机运行前，请先处理以下开发期配置：

1. `backend/machine/train_model.py` 中的模型保存目录目前包含本机绝对路径。
2. `backend/main.py` 中的部分模型与数据分析路径目前包含本机绝对路径。
3. 部分前端页面直接请求 `localhost:8000` 或 `127.0.0.1:8000`，部署时需要统一为环境变量或代理地址。
4. `backend/auth.py` 中的 JWT 密钥为开发值，正式部署前必须改为环境变量。
5. 当前用户密码以明文形式保存，正式部署前必须使用可靠的密码哈希方案。
6. 管理后台部分接口尚未启用身份与角色校验，不能直接暴露到公网。
7. `GCN/predict.py` 当前是预测接口原型，尚未接入正式训练后的图神经网络权重。

## 建议的下一步

- 将所有路径、密钥和接口地址迁移到环境变量。
- 增加 `requirements.txt` 或 Conda 环境文件，固定后端依赖版本。
- 为注册、预测、训练和数据增强接口补充自动化测试。
- 接入正式 GCN 模型，并记录数据集划分、RMSE、R² 和适用范围。
- 增加任务队列、模型版本管理、异常日志与数据备份机制。
- 补充系统界面截图、演示视频和经过授权的示例数据。

## 免责声明

本项目提供的预测结果仅用于科研探索和候选材料初步筛选。材料的关键性能及安全性仍应通过规范实验进行验证。

## 许可证

本仓库目前未声明开源许可证。在许可证补充之前，代码的复制、修改、分发和商业使用权限均需获得项目作者授权。
