from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import User
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from GCN.predict import predict_property
from jose import jwt
from auth import get_current_user, SECRET_KEY, ALGORITHM
from models import User, PredictionHistory, Model, Dataset, AugmentDataset, Poly, Administer, MLModel, TrainingResult, DatasetFeature
from datetime import datetime
from mol3d import smiles_to_molblock
from fastapi import UploadFile, File, Form
from strengthen.augment import augment_data
from strengthen.analysis import analyze_original_vs_augmented
import shutil
import sqlite3
import os
from pathlib import Path
from machine.train_model import MLPModelTrainer

from rdkit import Chem
from rdkit.Chem import Descriptors, rdMolDescriptors
Base.metadata.create_all(bind=engine)  # 创建表

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 依赖：获取数据库 session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 请求体
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

class PredictRequest(BaseModel):
    smiles: str
    model: int

class TrainingConfig(BaseModel):
    model_name: str
    model_description: str
    model_save_path: str
    train_data_path: str
    test_data_path: str
    epochs: int
    batch_size: int
    learning_rate: float
    cv_folds: int
    hidden_units: int
    use_cv: bool
    use_early_stop: bool
    patience: int
    dataset_type: str
    random_split: bool
    test_size: float
    seed: int

class Payment(BaseModel):
    id: str
    amount: float
    status: str
    email: str

class Mol3DRequest(BaseModel):
    smiles: str

class MLPTrainingRequest(BaseModel):
    train_data_path: str = "backend/machine/dataset_train.csv"
    test_data_path: str = "backend/machine/dataset_test.csv"
    model_name: str = "mlp_model"
    n_splits: int = 2
    max_iter: int = 1000
    hidden_layer_sizes: tuple = (100, 50)

class MLPPredictRequest(BaseModel):
    smiles: str
    model_path: str 
    scaler_path: str 

class AugmentRequest(BaseModel):
    train_path: str
    test_path: str
    output_path: str
    n_times: int = 1
# 模拟数据
# mock_payments = [
#     {
#         "id": "728ed52f",
#         "amount": 100.50,
#         "status": "pending",
#         "email": "user1@example.com"
#     },
#     {
#         "id": "489e1d42",
#         "amount": 200.00,
#         "status": "success",
#         "email": "user2@example.com"
#     },
#     {
#         "id": "3a7b9c1d",
#         "amount": 150.75,
#         "status": "failed",
#         "email": "user3@example.com"
#     },
#     {
#         "id": "9f2e8a4b",
#         "amount": 300.25,
#         "status": "pending",
#         "email": "user4@example.com"
#     },
#     {
#         "id": "5c6d7e8f",
#         "amount": 75.00,
#         "status": "success",
#         "email": "user5@example.com"
#     },
#     {
#         "id": "1a2b3c4d",
#         "amount": 450.00,
#         "status": "success",
#         "email": "vip@example.com"
#     },
#     {
#         "id": "e5f6a7b8",
#         "amount": 99.99,
#         "status": "pending",
#         "email": "test@example.com"
#     },
#     {
#         "id": "c9d0e1f2",
#         "amount": 1250.00,
#         "status": "success",
#         "email": "premium@example.com"
#     }
# ]
@app.post("/api/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = jwt.encode(
        {"user_id": user.id},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.post("/api/register")
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # 1. 检查用户名是否存在
    user = db.query(User).filter(User.username == data.username).first()
    if user:
        raise HTTPException(status_code=400, detail="用户名已存在")

    # 2. 创建用户（暂时不加密，先跑通）
    new_user = User(
        username=data.username,
        password=data.password
    )
    db.add(new_user)
    db.commit()

    return {"message": "注册成功"}

@app.post("/api/predict")
def predict(
    data: PredictRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        result = predict_property(data.smiles, data.model)

        history = PredictionHistory(
            user_id=user.id,
            smiles=data.smiles,
            model=data.model,
            result=str(result),
        )

        db.add(history)
        db.commit()
        print("DEBUG user.id =", user.id)
        return {"result": result}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.post("/api/train_config")
def save_train_config(
    data: TrainingConfig,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 检查模型名称是否已存在
    existing_model = db.query(Model).filter(
        Model.name == data.model_name,
        Model.user_id == user.id
    ).first()


    if existing_model:
        raise HTTPException(status_code=400, detail="模型名称已存在")

    # 创建新模型记录
    new_model = Model(
        user_id=user.id,
        name=data.model_name,
        description=data.model_description,
        path=data.model_save_path,
        epoch=data.epochs,
        batch=data.batch_size,
        learning_rate=data.learning_rate,
        hidden_layer=data.hidden_units,
        cross_validate=str(data.cv_folds) if data.use_cv else "None",
        test_proportion=data.test_size,
        patience=data.patience,
        rmse_path="",  # 暂时为空，训练后填充
        predict_path="",  # 暂时为空
    )
    print("DEBUG user.id =", user.id)
    db.add(new_model)
    db.commit()
    db.refresh(new_model)
    return {"message": "训练配置已保存", "model_id": new_model.id}
    
@app.get("/api/history")
def get_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == user.id)
        .order_by(PredictionHistory.created_at.desc())
        .all()
    )

    return [
        {
            "smiles": r.smiles,
            "model": r.model,
            "result": r.result,
            "time": r.created_at,
        }
        for r in records
    ]

# @app.get("/api/admin")
# async def get_admin_data():
#     """
#     返回模拟的支付数据供前端表格显示
#     """
#     try:
#         # 直接返回模拟数据
#         return mock_payments
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"服务器错误: {str(e)}")

# 新增：获取单个数据（可选）
# @app.get("/api/admin/{payment_id}")
# async def get_payment_by_id(payment_id: str):
#     """
#     根据ID获取单个支付记录
#     """
#     for payment in mock_payments:
#         if payment["id"] == payment_id:
#             return payment
#     raise HTTPException(status_code=404, detail="未找到该记录")
@app.get("/api/models")
def get_user_models(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    models = (
        db.query(Model)
        .filter(Model.user_id == user.id)
        .order_by(Model.id.desc())
        .all()
    )

    return [
        {
            "id": m.id,
            "name": m.name,
            "description": m.description,
        }
        for m in models
    ]
@app.get("/api/models/{model_id}")
def get_model_detail(
    model_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    model = (
        db.query(Model)
        .filter(Model.id == model_id, Model.user_id == user.id)
        .first()
    )

    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")

    return {
        "id": model.id,
        "name": model.name,
        "description": model.description,
        "path": model.path,
        "epoch": model.epoch,
        "batch": model.batch,
        "learning_rate": model.learning_rate,
        "hidden_layer": model.hidden_layer,
        "cross_validate": model.cross_validate,
        "test_proportion": model.test_proportion,
        "patience": model.patience,
        "rmse_path": model.rmse_path,
        "predict_path": model.predict_path,
    }

@app.delete("/api/models/{model_id}")
def delete_model(
    model_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    model = (
        db.query(Model)
        .filter(Model.id == model_id, Model.user_id == user.id)
        .first()
    )

    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")

    # 删除数据库中的模型记录
    db.delete(model)
    db.commit()

    return {"message": "模型已删除"}

# 在 main.py 中添加
@app.get("/api/admin/user_models")
def get_all_user_models(
    #user: User = Depends(get_current_user),  # 需要登录
    db: Session = Depends(get_db),
):
    """
    获取 user_models 表中的所有数据，返回所有字段
    """
    try:
        # 查询所有模型
        models = (
            db.query(Model)
            .order_by(Model.created_at.desc())
            .all()
        )

        if not models:
            return []

        # 构建返回数据，包含所有字段
        result = []
        for model in models:
            result.append({
                "id": model.id,
                "user_id": model.user_id,
                "name": model.name,
                "description": model.description,
                "path": model.path,
                "created_at": str(model.created_at),
                "epoch": model.epoch,
                "batch": model.batch,
                "learning_rate": model.learning_rate,
                "hidden_layer": model.hidden_layer,
                "cross_validate": model.cross_validate,
                "test_proportion": model.test_proportion,
                "patience": model.patience,
            #     "rmse_path": model.rmse_path,
            #     "predict_path": model.predict_path,
            })

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"获取用户模型数据失败: {str(e)}"
        )

@app.get("/api/admin/{table_name}")
def get_table_data(table_name: str, db: Session = Depends(get_db)):
    allowed_tables = ["users", "prediction_history", "user_models", "administer", "augment_dataset", "dataset", "poly", "ml_models", "training_results", "dataset_features"]
    if table_name not in allowed_tables:
        raise HTTPException(status_code=403, detail="Table not allowed")
    try:
        if table_name == "users":
            data = db.query(User).all()
            return [{"id": u.id, "username": u.username, "created_at": str(u.created_at)} for u in data]
        elif table_name == "prediction_history":
            data = db.query(PredictionHistory).all()
            return [{"id": p.id, "user_id": p.user_id, "smiles": p.smiles, "model": p.model, "result": p.result, "created_at": str(p.created_at)} for p in data]
        elif table_name == "user_models":
            data = db.query(Model).all()
            return [{"id": m.id, "user_id": m.user_id, "name": m.name, "description": m.description, "path": m.path, "created_at": str(m.created_at), "epoch": m.epoch, "batch": m.batch, "learning_rate": m.learning_rate, "hidden_layer": m.hidden_layer, "cross_validate": m.cross_validate, "test_proportion": m.test_proportion, "patience": m.patience, "rmse_path": m.rmse_path, "predict_path": m.predict_path} for m in data]
        elif table_name == "dataset":
            data = db.query(Dataset).all()
            return [{"id": d.id, "user_id": d.user_id, "url": d.url} for d in data]
        elif table_name == "augment_dataset":
            data = db.query(AugmentDataset).all()
            return [{"id": a.id, "user_id": a.user_id, "type": a.type, "url": a.url} for a in data]
        elif table_name == "poly":
            data = db.query(Poly).all()
            return [{"id": p.id, "smiles": p.smiles, "tg": p.tg} for p in data]
        elif table_name == "administer":
            data = db.query(Administer).all()
            return [{"id": a.id, "username": a.username} for a in data]  # 不返回 password
        elif table_name == "ml_models":
            data = db.query(MLModel).all()
            return [{"id": m.id, "name": m.name, "user_id": m.user_id, "path": m.path, "created_at": str(m.created_at)} for m in data]
        elif table_name == "training_results":
            data = db.query(TrainingResult).all()
            return [{"id": t.id, "model_name": t.model_name, "model_id": t.model_id, "rmse": t.rmse, "r_squared": t.r_squared} for t in data]
        elif table_name == "dataset_features":
            data = db.query(DatasetFeature).all()
            return [{"id": d.id, "dataset_id": d.dataset_id, "mean": d.mean, "max": d.max, "min": d.min, "median": d.median, "pcd": d.pcd} for d in data]
        else:
            return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @app.post("/api/mol3d")
# def get_mol_3d(req: Mol3DRequest):
#     try:
#         mol_block = smiles_to_molblock(req.smiles)
#         return {
#             "mol_block": mol_block
#         }
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))
@app.post("/api/mol3d")
def get_mol_3d(req: Mol3DRequest):
    try:
        # 原来的 3D
        mol_block = smiles_to_molblock(req.smiles)

        # 👇 新增：解析分子（用于算性质）
        mol = Chem.MolFromSmiles(req.smiles)
        if mol is None:
            raise ValueError("Invalid SMILES")

        # 👇 分子性质（推荐用“不带H”的）
        properties = {
            "molecular_weight": round(Descriptors.MolWt(mol), 2),
            "logp": round(Descriptors.MolLogP(mol), 2),
            "tpsa": round(rdMolDescriptors.CalcTPSA(mol), 2),
            "hbd": rdMolDescriptors.CalcNumHBD(mol),
            "hba": rdMolDescriptors.CalcNumHBA(mol),
            "num_atoms": mol.GetNumAtoms(),
            # ⭐ 加分项
            "formula": rdMolDescriptors.CalcMolFormula(mol),
            "rotatable_bonds": rdMolDescriptors.CalcNumRotatableBonds(mol),
        }

        return {
            "mol_block": mol_block,
            "properties": properties
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# MLP 模型训练和预测端点
@app.post("/api/train_mlp")
async def train_mlp_model(
    train_file: UploadFile = File(...),
    test_file: UploadFile = File(...),
    model_name: str = Form(...),
    n_splits: int = Form(5),
    max_iter: int = Form(1000),
    hidden_layer_sizes: str = Form(...)
):
    """训练 MLP 模型"""
    try:
        os.makedirs("uploads", exist_ok=True)

        # 保存训练集
        train_path = f"uploads/{train_file.filename}"
        with open(train_path, "wb") as buffer:
            shutil.copyfileobj(train_file.file, buffer)

        # 保存测试集
        test_path = f"uploads/{test_file.filename}"
        with open(test_path, "wb") as buffer:
            shutil.copyfileobj(test_file.file, buffer)

        # hidden_layer_sizes 从字符串转 list
        import json
        hidden_layers = json.loads(hidden_layer_sizes)

        trainer = MLPModelTrainer(model_name=model_name)

        # 训练模型
        results = trainer.train(
            train_data_path=train_path,
            test_data_path=test_path,
            n_splits=n_splits,
            max_iter=max_iter,
            hidden_layer_sizes=hidden_layers
        )

        # 保存模型
        save_result = trainer.save_model()

        return {
            "message": "模型训练成功",
            "training_results": results,
            "model_info": save_result
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"训练失败: {str(e)}")
    
@app.post("/api/predict_mlp")
def predict_mlp(data: MLPPredictRequest):
    """使用训练好的 MLP 模型进行预测"""
    try:
        trainer = MLPModelTrainer()
        
        # 使用最新保存的模型或指定的模型
        if data.model_path and data.scaler_path:
            trainer.load_model(data.model_path, data.scaler_path)
        else:
            # 找到最新的模型文件
            model_dir = "E:/project1/backend/machine"
            model_files = sorted(
                [f for f in os.listdir(model_dir) if f.startswith("mlp_model_") and f.endswith(".pkl")],
                reverse=True
            )
            scaler_files = sorted(
                [f for f in os.listdir(model_dir) if f.startswith("mlp_model_scaler_") and f.endswith(".pkl")],
                reverse=True
            )
            
            if not model_files or not scaler_files:
                raise ValueError("未找到已保存的模型文件。请先训练模型。")
            
            model_path = os.path.join(model_dir, model_files[0])
            scaler_path = os.path.join(model_dir, scaler_files[0])
            trainer.load_model(model_path, scaler_path)
        
        # 进行预测
        prediction = trainer.predict(data.smiles)
        
        return {
            "smiles": data.smiles,
            "predicted_tg": prediction,
            "message": "预测成功"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"预测失败: {str(e)}")

@app.get("/api/mlp_models")
def get_mlp_models():
    """获取已保存的 MLP 模型列表"""
    try:
        model_dir = "backend/machine"
        if not os.path.exists(model_dir):
            return {"models": []}
        
        model_files = [f for f in os.listdir(model_dir) 
                      if f.startswith("mlp_model_") and f.endswith(".pkl") 
                      and "scaler" not in f]
        
        models = [
            {
                "filename": f,
                "path": os.path.join(model_dir, f),
                "created_time": os.path.getctime(os.path.join(model_dir, f))
            }
            for f in sorted(model_files, reverse=True)
        ]
        
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"获取模型失败: {str(e)}")

@app.post("/api/augment")
async def run_augment(
    train_file: UploadFile = File(...),
    test_file: UploadFile = File(...),
    output_path: str = Form(...),
    n_times: int = Form(...)
):
    try:
        os.makedirs("temp", exist_ok=True)

        train_path = f"temp/{train_file.filename}"
        test_path = f"temp/{test_file.filename}"

        with open(train_path, "wb") as f:
            shutil.copyfileobj(train_file.file, f)

        with open(test_path, "wb") as f:
            shutil.copyfileobj(test_file.file, f)

        result = augment_data(
            train_path=train_path,
            test_path=test_path,
            output_path=output_path,
            n_times=n_times,
        )

        return {
            "success": True,
            "data": result,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }
    
@app.get("/api/compare")
def compare_fixed():
    try:

        original_csv = "E:/project1/backend/strengthen/data/train.csv"
        augmented_csv = "E:/project1/backend/strengthen/data/augmented_data.csv"
       
        analysis = analyze_original_vs_augmented(
            original_csv=original_csv,
            augmented_csv=augmented_csv,
            bins=20
        )
        return {"success": True, "data": analysis}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
